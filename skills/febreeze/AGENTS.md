# Febreeze package

Maintain these boundaries:

- `SKILL.md` is the canonical runtime workflow; route every bundled resource
  from it with an explicit loading condition.
- `README.md` is human-facing and must not supply required runtime instructions.
- `references/smells.md` is diagnostic and must not override a rule.
- `build.config.json` selects canonical workbench rules.
- `rules/` is generated. Edit the repository root `rules/`, then rebuild.

Keep detailed guidance in one canonical place. Use only `name` and `description`
in SKILL.md frontmatter.

Preserve these invariants:

- Define a smell as a structural choice that creates friction when code changes.
- Require repository evidence before reporting a smell.
- Favor reframing that removes concepts, branches, states, or layers.
- Keep audits report-only unless the user requests fixes.

From the repository root, run:

```sh
npm run build
npm test
npm run check
```

Validate `SKILL.md` with an Agent Skills-compatible validator when available.
Do not finish with stale generated rules or unresolved placeholders.
