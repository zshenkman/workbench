# Febreeze

Febreeze finds structural code smells and refactors them into a cleaner design.
It treats working behavior as necessary but not sufficient: a change should not
leave the surrounding system harder to understand or change.

## Install

Install Febreeze from the workbench catalog:

```sh
npx skills add zshenkman/workbench --skill febreeze
```

## Use

Ask an agent to audit without editing:

```text
Use $febreeze to audit this branch for structural regressions.
```

Ask it to redesign and fix confirmed smells:

```text
Use $febreeze to clean up this subsystem. Reframe the design where that removes
complexity, then carry the refactor through every affected consumer.
```

Febreeze supports branch reviews and broader codebase audits. Findings must tie
repository evidence to a concrete change cost, defect risk, hidden invariant, or
reader burden.

## Package

- `SKILL.md` defines activation, workflow, completion, and reporting.
- `AGENTS.md` defines how contributors and agents maintain this package.
- `build.config.json` selects canonical workbench rules for the skill.
- `rules/` contains generated, self-contained copies of those rules.
- `references/smells.md` provides diagnostic signals, counterexamples, and
  reframing moves.

The files under `rules/` are generated. Edit their canonical sources in the
repository root and run the build.

## Develop

From the repository root:

```sh
npm run build
npm test
npm run check
```

Keep `SKILL.md` focused on decisions and workflow. Put normative engineering
behavior in canonical rules and supporting diagnostic material in references.
