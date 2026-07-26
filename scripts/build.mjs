#!/usr/bin/env node

import { constants } from "node:fs";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { ruleBuildStep } from "./build/rules.mjs";

const DEFAULT_REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BUILD_STEPS = [ruleBuildStep];

function parseArguments(argumentsList) {
  const options = {
    checkOnly: false,
    repositoryRoot: DEFAULT_REPOSITORY_ROOT,
  };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];

    if (argument === "--check") {
      options.checkOnly = true;
      continue;
    }

    if (argument === "--root") {
      const repositoryRoot = argumentsList[index + 1];
      if (!repositoryRoot) {
        throw new Error("--root requires a directory path.");
      }
      options.repositoryRoot = path.resolve(repositoryRoot);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validateSkillConfig(skillName, skillConfig) {
  if (!isPlainObject(skillConfig)) {
    throw new Error(`Config for skill "${skillName}" must be a JSON object.`);
  }
}

async function pathExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function loadSkillConfigs(repositoryRoot) {
  const skillsDirectory = path.join(repositoryRoot, "skills");
  const entries = await readdir(skillsDirectory, { withFileTypes: true });
  const skills = {};

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillName = entry.name;
    if (!SKILL_NAME_PATTERN.test(skillName)) {
      throw new Error(`Skill name must use lowercase hyphen-case: ${skillName}`);
    }

    const configPath = path.join(
      skillsDirectory,
      skillName,
      "build.config.json",
    );
    if (!(await pathExists(configPath))) {
      continue;
    }

    try {
      const skillConfig = JSON.parse(await readFile(configPath, "utf8"));
      validateSkillConfig(skillName, skillConfig);
      skills[skillName] = skillConfig;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Skill config is not valid JSON: ${configPath}`);
      }
      throw error;
    }
  }

  return { skills };
}

export async function run(argumentsList = process.argv.slice(2)) {
  const options = parseArguments(argumentsList);
  const config = await loadSkillConfigs(options.repositoryRoot);

  const plannedSteps = [];
  for (const buildStep of BUILD_STEPS) {
    plannedSteps.push({
      buildStep,
      plan: await buildStep.createPlan({
        config,
        repositoryRoot: options.repositoryRoot,
      }),
    });
  }

  if (options.checkOnly) {
    const differences = (
      await Promise.all(
        plannedSteps.map(({ buildStep, plan }) => buildStep.check(plan)),
      )
    ).flat();

    if (differences.length > 0) {
      throw new Error(
        `Build outputs are out of date:\n${differences
          .map((difference) => `- ${difference}`)
          .join("\n")}`,
      );
    }

    for (const { buildStep, plan } of plannedSteps) {
      process.stdout.write(
        `Checked ${buildStep.name}: ${buildStep.describe(plan)}.\n`,
      );
    }
    process.stdout.write("Build outputs are current.\n");
    return;
  }

  for (const { buildStep, plan } of plannedSteps) {
    await buildStep.build(plan);
    process.stdout.write(
      `Built ${buildStep.name}: ${buildStep.describe(plan)}.\n`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
