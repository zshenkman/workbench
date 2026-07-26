# Workbench

Reusable AI development rules, skills, hooks, and tooling for Codex, Claude, Cursor, and other agents.

## Skills

Skills live in `skills/<skill-name>/SKILL.md`. A skill may also include `scripts/`, `references/`, and `assets/` alongside its `SKILL.md`.

The skills catalog is intentionally empty for now.

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
