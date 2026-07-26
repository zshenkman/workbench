---
name: febreeze
description: Find and remove structural code smells through ambitious review and refactoring. Use for deep code-quality audits, architectural cleanup, accidental complexity, and changes that work but worsen the design.
---

# Febreeze

Find the code that makes change harder than it should be. Reframe the design so
the source of that friction disappears.

Working code is not clean code when it leaves the surrounding system harder to
understand or change. Prefer a coherent end state over a small diff.

## Load the relevant guidance

Load a rule before judging or changing the structure it governs:

- Read `rules/abstractions.md` before reviewing, adding, or removing helpers,
  wrappers, interfaces, shared utilities, generic types, or layers.
- Read `rules/scaffolding.md` before reviewing or changing files, modules,
  ownership, boundaries, dependency direction, state, or side effects.
- Read both `rules/naming.md` and `rules/code-naming.md` before reporting a code
  naming smell or performing a rename.
- Read both `rules/naming.md` and `rules/database-naming.md` before reviewing or
  changing a relational schema.

For a broad audit, read `rules/abstractions.md`, `rules/scaffolding.md`, and
`references/smells.md` before forming findings. Read `references/smells.md` for
an ambiguous candidate or when comparing structural remedies. Treat the rules
as normative and the reference as diagnostic guidance.

## Choose the lens

- For a branch or diff review, compare the change with its base. Decide whether
  it improves or degrades the local architecture.
- For a codebase audit, trace representative behavior and find decisions that
  create recurring friction. Do not inventory every untidy surface.
- For a report-only request, do not edit.
- For a fix request, carry the redesign through every affected producer,
  consumer, test, configuration path, and persisted representation.

## Inspect

Read repository instructions and inspect the working tree. Preserve unrelated
changes. Check the base diff when one exists.

Trace the relevant behavior through entry points, state, transformations, side
effects, boundaries, and tests. Identify who owns each decision and where each
invariant is enforced. Inspect callers before judging a local implementation;
the visible symptom often originates at a boundary.

Use tests, history, issue context, and repeated implementations when they reveal
actual change pressure. Check installed versions and official documentation
before changing framework or library patterns.

## Form findings

Treat a smell as a structural choice that creates friction when the software
changes. Size, duplication, indirection, and complexity are clues, not verdicts.

Express each finding as a causal argument:

1. Show the concrete structure.
2. Explain the change, failure, or reader burden it creates.
3. Name the underlying ownership, model, boundary, or control-flow problem.
4. Describe the cleaner end state.

Group symptoms that share one cause. Prefer a few high-confidence structural
findings over a long list of nits. Drop a finding when evidence does not connect
the pattern to a real cost or its cure adds equal or greater conceptual weight.

## Reframe before polishing

Treat the current implementation as one proposal, not a constraint. Search for
the code-judo move: a different model, owner, boundary, or flow that makes whole
branches, modes, helpers, or layers unnecessary.

Ask:

- Can the problem be stated with fewer concepts?
- Can one owner replace scattered coordination?
- Can the state model make invalid cases impossible?
- Can a special case become part of a simpler default flow?
- Can a layer, adapter, flag, or compatibility path disappear?
- Does the refactor delete complexity or merely move it?

Do not settle for a tidier version of the same confused design when a plausible
reframing removes the confusion. Redraw boundaries, replace data shapes,
collapse layers, split responsibilities, or remove abstractions when that is
the honest fix.

Before broad edits, state the target model, its owners, and its invariants. Ask
for direction when the clean design requires a product decision, an intentional
compatibility break, or an irreversible migration.

## Refactor completely

1. Establish the new canonical owner, contract, state model, or boundary.
2. Move every affected caller and representation.
3. Update tests around observable behavior and important failure modes.
4. Delete the superseded path, obsolete adapter, temporary flag, dead
   configuration, and stale commentary.
5. Inspect the full diff for half-migrations and accidental behavior changes.

Preserve intentional external behavior unless the user authorizes changing it.
Do not keep two competing designs solely to reduce churn.

## Enforce the quality bar

Do not approve or call the work clean until:

- The result is no more structurally complex than its baseline.
- No obvious simpler model removes a meaningful category of machinery.
- Each important decision and invariant has one clear owner.
- The old source of friction and its competing path are gone.
- The improvement can be explained in plain terms.
- Observable behavior and important failure modes are verified in proportion
  to the change.

Run the relevant tests, type checks, builds, linters, migrations, benchmarks, or
manual flows. Report existing failures and unverified areas plainly.

## Report

For an audit, lead with the few highest-leverage findings. State whether each
one blocks acceptance, show the evidence, explain the cost, and describe the
clean end state.

For a refactor, lead with the resulting design. Explain which concepts
disappeared, which consumers moved, and how the result was verified.
