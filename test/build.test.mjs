import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const buildScriptPath = fileURLToPath(
  new URL("../scripts/build.mjs", import.meta.url),
);

async function createFixture(t) {
  const repositoryRoot = await mkdtemp(
    path.join(os.tmpdir(), "workbench-build-"),
  );
  t.after(() => rm(repositoryRoot, { force: true, recursive: true }));
  await mkdir(path.join(repositoryRoot, "rules"));
  await mkdir(path.join(repositoryRoot, "skills"));
  return repositoryRoot;
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function createSkill(repositoryRoot, skillName) {
  const skillDirectory = path.join(repositoryRoot, "skills", skillName);
  await mkdir(skillDirectory, { recursive: true });
  await writeFile(
    path.join(skillDirectory, "SKILL.md"),
    `---\nname: ${skillName}\ndescription: Test skill.\n---\n`,
  );
  return skillDirectory;
}

function runBuild(repositoryRoot, ...argumentsList) {
  return spawnSync(
    process.execPath,
    [
      buildScriptPath,
      "--root",
      repositoryRoot,
      ...argumentsList,
    ],
    { encoding: "utf8" },
  );
}

test("runs the rules step without requiring every skill to configure rules", async (t) => {
  const repositoryRoot = await createFixture(t);
  const skillDirectory = await createSkill(repositoryRoot, "future-skill");
  await writeJson(path.join(skillDirectory, "build.config.json"), {});

  const buildResult = runBuild(repositoryRoot);

  assert.equal(buildResult.status, 0, buildResult.stderr);
  assert.match(buildResult.stdout, /Built rules: 0 rules across 0 skills/);
});

test("builds configured rules and removes stale generated files", async (t) => {
  const repositoryRoot = await createFixture(t);
  const skillDirectory = await createSkill(repositoryRoot, "code-review");

  await writeFile(path.join(repositoryRoot, "rules", "naming.md"), "naming\n");
  await writeFile(
    path.join(repositoryRoot, "rules", "code-naming.md"),
    "code naming\n",
  );
  await mkdir(path.join(skillDirectory, "rules"));
  await writeFile(path.join(skillDirectory, "rules", "stale.md"), "stale\n");
  await writeJson(path.join(skillDirectory, "build.config.json"), {
    rules: ["naming.md", "code-naming.md"],
  });

  const buildResult = runBuild(repositoryRoot);

  assert.equal(buildResult.status, 0, buildResult.stderr);
  assert.match(buildResult.stdout, /Built rules: 2 rules across 1 skill/);
  assert.equal(
    await readFile(path.join(skillDirectory, "rules", "naming.md"), "utf8"),
    "naming\n",
  );
  assert.equal(
    await readFile(
      path.join(skillDirectory, "rules", "code-naming.md"),
      "utf8",
    ),
    "code naming\n",
  );
  await assert.rejects(access(path.join(skillDirectory, "rules", "stale.md")));

  const checkResult = runBuild(repositoryRoot, "--check");
  assert.equal(checkResult.status, 0, checkResult.stderr);
  assert.match(checkResult.stdout, /Build outputs are current/);
});

test("check mode reports changed and extra generated rules without writing", async (t) => {
  const repositoryRoot = await createFixture(t);
  const skillDirectory = await createSkill(repositoryRoot, "code-review");
  const sourceRulePath = path.join(repositoryRoot, "rules", "naming.md");
  const generatedRulePath = path.join(
    skillDirectory,
    "rules",
    "naming.md",
  );

  await writeFile(sourceRulePath, "original\n");
  await writeJson(path.join(skillDirectory, "build.config.json"), {
    rules: ["naming.md"],
  });
  assert.equal(runBuild(repositoryRoot).status, 0);

  await writeFile(sourceRulePath, "updated\n");
  await writeFile(path.join(skillDirectory, "rules", "extra.md"), "extra\n");

  const checkResult = runBuild(repositoryRoot, "--check");

  assert.equal(checkResult.status, 1);
  assert.match(checkResult.stderr, /changed code-review\/rules\/naming\.md/);
  assert.match(checkResult.stderr, /extra code-review\/rules\/extra\.md/);
  assert.equal(await readFile(generatedRulePath, "utf8"), "original\n");
});

test("validates the complete plan before replacing generated rules", async (t) => {
  const repositoryRoot = await createFixture(t);
  const skillDirectory = await createSkill(repositoryRoot, "code-review");
  const existingRulePath = path.join(
    skillDirectory,
    "rules",
    "existing.md",
  );

  await mkdir(path.dirname(existingRulePath));
  await writeFile(existingRulePath, "preserve\n");
  await writeFile(path.join(repositoryRoot, "rules", "naming.md"), "naming\n");
  await writeJson(path.join(skillDirectory, "build.config.json"), {
    rules: ["naming.md"],
  });
  const missingSkillDirectory = path.join(
    repositoryRoot,
    "skills",
    "missing-skill",
  );
  await mkdir(missingSkillDirectory);
  await writeJson(path.join(missingSkillDirectory, "build.config.json"), {
    rules: ["naming.md"],
  });

  const buildResult = runBuild(repositoryRoot);

  assert.equal(buildResult.status, 1);
  assert.match(buildResult.stderr, /Configured skill is missing SKILL\.md/);
  assert.equal(await readFile(existingRulePath, "utf8"), "preserve\n");
});

test("rejects rule paths outside the canonical rules directory", async (t) => {
  const repositoryRoot = await createFixture(t);
  const skillDirectory = await createSkill(repositoryRoot, "code-review");
  await writeJson(path.join(skillDirectory, "build.config.json"), {
    rules: ["../outside.md"],
  });

  const buildResult = runBuild(repositoryRoot);

  assert.equal(buildResult.status, 1);
  assert.match(buildResult.stderr, /Rule path/);

  await writeJson(path.join(skillDirectory, "build.config.json"), {
    rules: ["..\\outside.md"],
  });

  const windowsPathResult = runBuild(repositoryRoot);

  assert.equal(windowsPathResult.status, 1);
  assert.match(
    windowsPathResult.stderr,
    /Rule path must be normalized and relative/,
  );
});

test("reports the skill config path when JSON is invalid", async (t) => {
  const repositoryRoot = await createFixture(t);
  const skillDirectory = await createSkill(repositoryRoot, "code-review");
  const configPath = path.join(skillDirectory, "build.config.json");
  await writeFile(configPath, "{");

  const buildResult = runBuild(repositoryRoot);

  assert.equal(buildResult.status, 1);
  assert.match(buildResult.stderr, /Skill config is not valid JSON/);
  assert.match(buildResult.stderr, /code-review\/build\.config\.json/);
});
