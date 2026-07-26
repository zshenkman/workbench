import { constants } from "node:fs";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function describeCount(count, singularName) {
  const name = count === 1 ? singularName : `${singularName}s`;
  return `${count} ${name}`;
}

function validateRelativeRulePath(rulePath) {
  if (typeof rulePath !== "string" || rulePath.length === 0) {
    throw new Error("Rule paths must be non-empty strings.");
  }

  if (
    rulePath.includes("\\") ||
    path.isAbsolute(rulePath) ||
    path.posix.normalize(rulePath) !== rulePath
  ) {
    throw new Error(`Rule path must be normalized and relative: ${rulePath}`);
  }

  const segments = rulePath.split("/");
  if (
    segments.some(
      (segment) =>
        segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    throw new Error(`Rule path cannot contain empty or dot segments: ${rulePath}`);
  }

  if (path.extname(rulePath) !== ".md") {
    throw new Error(`Rule path must identify a Markdown file: ${rulePath}`);
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

async function createPlan({ config, repositoryRoot }) {
  const rulesDirectory = path.join(repositoryRoot, "rules");
  const skillsDirectory = path.join(repositoryRoot, "skills");
  const skillPlans = [];

  for (const [skillName, skillConfig] of Object.entries(config.skills)) {
    if (skillConfig.rules === undefined) {
      continue;
    }

    if (!Array.isArray(skillConfig.rules) || skillConfig.rules.length === 0) {
      throw new Error(
        `Skill "${skillName}" must declare at least one rule path.`,
      );
    }

    const uniqueRulePaths = new Set();
    for (const rulePath of skillConfig.rules) {
      validateRelativeRulePath(rulePath);
      if (uniqueRulePaths.has(rulePath)) {
        throw new Error(
          `Skill "${skillName}" declares rule "${rulePath}" more than once.`,
        );
      }
      uniqueRulePaths.add(rulePath);
    }

    const skillDirectory = path.join(skillsDirectory, skillName);
    const skillDefinitionPath = path.join(skillDirectory, "SKILL.md");
    if (!(await pathExists(skillDefinitionPath))) {
      throw new Error(
        `Configured skill is missing SKILL.md: ${skillDefinitionPath}`,
      );
    }

    const rules = [];
    for (const rulePath of skillConfig.rules) {
      const sourcePath = path.join(rulesDirectory, ...rulePath.split("/"));
      if (!(await pathExists(sourcePath))) {
        throw new Error(`Configured rule does not exist: ${sourcePath}`);
      }

      rules.push({
        content: await readFile(sourcePath),
        relativePath: rulePath,
      });
    }

    skillPlans.push({
      outputDirectory: path.join(skillDirectory, "rules"),
      rules,
      skillDirectory,
      skillName,
    });
  }

  return { skillPlans };
}

async function listFiles(directory, relativeDirectory = "") {
  const currentDirectory = path.join(directory, relativeDirectory);
  if (!(await pathExists(currentDirectory))) {
    return [];
  }

  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(directory, relativePath)));
      continue;
    }
    files.push(relativePath);
  }

  return files.sort();
}

async function findDrift(skillPlan) {
  const expectedRulesByPath = new Map(
    skillPlan.rules.map((rule) => [rule.relativePath, rule]),
  );
  const expectedPaths = [...expectedRulesByPath.keys()].sort();
  const actualPaths = await listFiles(skillPlan.outputDirectory);
  const differences = [];

  for (const expectedPath of expectedPaths) {
    if (!actualPaths.includes(expectedPath)) {
      differences.push(`missing ${skillPlan.skillName}/rules/${expectedPath}`);
      continue;
    }

    const actualContent = await readFile(
      path.join(skillPlan.outputDirectory, ...expectedPath.split("/")),
    );
    if (!actualContent.equals(expectedRulesByPath.get(expectedPath).content)) {
      differences.push(`changed ${skillPlan.skillName}/rules/${expectedPath}`);
    }
  }

  for (const actualPath of actualPaths) {
    if (!expectedRulesByPath.has(actualPath)) {
      differences.push(`extra ${skillPlan.skillName}/rules/${actualPath}`);
    }
  }

  return differences;
}

async function check(plan) {
  return (
    await Promise.all(plan.skillPlans.map((skillPlan) => findDrift(skillPlan)))
  ).flat();
}

async function buildSkillRules(skillPlan) {
  const temporaryDirectory = path.join(
    skillPlan.skillDirectory,
    `.rules-build-${process.pid}-${Date.now()}`,
  );

  await mkdir(temporaryDirectory);

  try {
    for (const rule of skillPlan.rules) {
      const outputPath = path.join(
        temporaryDirectory,
        ...rule.relativePath.split("/"),
      );
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, rule.content);
    }

    await rm(skillPlan.outputDirectory, { force: true, recursive: true });
    await rename(temporaryDirectory, skillPlan.outputDirectory);
  } catch (error) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }
}

async function build(plan) {
  for (const skillPlan of plan.skillPlans) {
    await buildSkillRules(skillPlan);
  }
}

function describe(plan) {
  const ruleCount = plan.skillPlans.reduce(
    (total, skillPlan) => total + skillPlan.rules.length,
    0,
  );
  return `${describeCount(ruleCount, "rule")} across ${describeCount(
    plan.skillPlans.length,
    "skill",
  )}`;
}

export const ruleBuildStep = {
  build,
  check,
  createPlan,
  describe,
  name: "rules",
};
