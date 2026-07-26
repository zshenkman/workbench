# Workbench

Reusable AI development rules, skills, hooks, and tooling for Codex, Claude, Cursor, and other agents.

## Rules

Canonical reusable rules live in `rules/`. Rules are normative instructions
that skills may include in their own `rules/` directories.

Keep each installed skill self-contained. When the catalog contains skills,
build the applicable canonical rules into each skill instead of linking outside
the skill directory.

## Skills

Skills live in `skills/<skill-name>/SKILL.md`. A skill may also include
`rules/`, `scripts/`, `references/`, and `assets/` alongside its `SKILL.md`.

- `rules/` contains normative instructions the skill must explicitly load.
- `references/` contains supporting domain information loaded when needed.
- `scripts/` contains deterministic operations.
- `assets/` contains files used to produce output.

The skills catalog is intentionally empty for now.

### Build skills

Declare each skill's generated resources in
`skills/<skill-name>/build.config.json`. For example,
`skills/code-review/build.config.json` can contain:

```json
{
  "rules": ["naming.md", "code-naming.md"]
}
```

The build runs an ordered set of resource steps. The rules step replaces each
configured skill's entire `rules/` directory with the selected files from the
root `rules/` directory. A skill with no `build.config.json`, or no `rules`
entry in its config, is ignored by that step. Every configured skill must also
contain `SKILL.md`.

Build all generated skill resources:

```sh
npm run build
```

Check that committed generated resources match their canonical sources:

```sh
npm run check
```

The check runs every build step and reports missing, changed, and extra
generated files without modifying them. Add new build steps to
`scripts/build.mjs`; keep each step's implementation under `scripts/build/`.

## Git hooks

Enable the tracked hooks for this clone:

```sh
npm run hooks:install
```

The pre-commit hook runs the test suite and verifies that generated skill
resources match their canonical sources.

### Install

Install every skill in the catalog once skills have been added:

```sh
npx skills add zshenkman/workbench
```

List the available skills:

```sh
npx skills add zshenkman/workbench --list
```

Install one skill:

```sh
npx skills add zshenkman/workbench --skill <skill-name>
```
