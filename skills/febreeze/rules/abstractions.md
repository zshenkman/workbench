# Abstractions

Apply this rule to helpers, wrappers, shared utilities, generic types, base
classes, interfaces, layers, and other indirection. Default to direct, concrete
code. Add or retain an abstraction only when it reduces total complexity and
makes the system easier for a capable newcomer to understand and change safely.

## When to Abstract

An abstraction must serve a current need and do at least one of these:

- name a stable domain concept accurately;
- enforce an invariant or prevent invalid states;
- isolate a real system boundary or volatile dependency;
- provide one contract for multiple current implementations;
- centralize policy that must change consistently; or
- hide incidental complexity without hiding the business flow.

Count the concept, contract, configuration, call sites, navigation cost, and
failure modes—not just removed lines. One consumer can justify an abstraction
that protects a boundary or invariant; reuse alone is neither required nor
sufficient.

Do not abstract solely because code looks similar, a function would become
shorter, reuse might appear later, a pattern expects another layer, a dependency
could have an interface, a generic form is possible, internals become easier to
test, or the result looks more consistent.

## Keep the Main Story Visible

- Leave self-explanatory language operations inline.
- Extract a secondary step when its domain name conveys more than its
  implementation.
- Keep control flow, state changes, I/O, retries, errors, expensive work, and
  side effects visible at the call site or explicit in the contract.
- Prefer small local repetition to distant indirection.
- Do not replace readable concrete code with a general mechanism that introduces
  more concepts than it removes.

For example, keep a clear `filter` and `reduce` inline. Extract predicates such
as `canIssueRefund` when the name represents shared refund policy; do not create
generic helpers that merely restate `filter` and `reduce`.

## Duplication

Treat duplication as evidence to inspect, not an instruction to abstract.

- Keep similar code separate when cases have different owners, rules, or reasons
  to change.
- Unify cases that encode one policy and must change together.
- Wait until the shared shape is clear.
- Do not force cases through mode flags, optional callbacks, or parameters that
  only some callers understand.
- When consumers share a small stable core but differ in orchestration, share
  the core and keep orchestration explicit.

## Contracts and Interfaces

- Define the smallest contract the consumer needs.
- Introduce an interface only at a meaningful boundary or for intentionally
  substitutable implementations.
- A single implementation can justify a boundary interface, such as
  `PaymentAuthorizer`, when it keeps vendor behavior outside domain policy.
- Do not mirror one concrete class in an interface unless that reduces coupling
  or protects a boundary.
- Keep contracts smaller and more stable than their implementations.
- Keep implementation-specific options out of shared contracts.
- Prefer domain operations to vague methods such as `execute`, `process`,
  `getData`, or `setValue`.
- Make ownership, units, nullability, errors, and side effects explicit.
- Remove pass-through layers that add no policy, translation, lifecycle, or
  stable contract.

## Parameters and Configuration

- Add a parameter, hook, callback, strategy, or plugin point only for variation
  required by a current caller.
- Prefer explicit variants when options represent distinct modes or permit
  invalid combinations.
- Avoid boolean arguments whose meaning is unclear at the call site.
- Keep option objects focused; continued growth often signals multiple hidden
  responsibilities.
- Use separate domain operations when preconditions, effects, or results differ:
  prefer `saveDraftOrder(order)` and `publishOrder(order)` to
  `saveOrder(order, true, false)`.

## Types and Generics

- Name a type when it clarifies a stable concept, boundary, owner, or invariant.
- Do not alias a primitive or shape without adding a semantic distinction.
- Use generics only when the algorithm is genuinely independent of the varied
  type; keep constraints narrow and readable.
- Prefer modest concrete duplication to conditional types, deeply nested mapped
  types, or type parameters that require expert decoding.
- Do not make a public type more general than its current behavior.
- Use discriminated unions or explicit variants to make valid states visible.

Types should explain the domain. A type that requires mentally executing a type
program is too costly for ordinary application code.

## Inheritance and Frameworks

- Prefer composition. Use inheritance only for a stable substitutable
  relationship, not to reuse a few methods.
- Keep hierarchies shallow and overridden behavior obvious.
- Do not add base-class hooks for imagined subclasses.
- Keep framework adapters thin. Do not recreate a framework behind a private,
  framework-shaped API without a concrete portability need.
- Prefer clear, established language and library features to local wrappers.

## Extracting or Simplifying

Before extracting:

1. Understand the concrete cases and the exact knowledge, invariant, or boundary
   they share.
2. Identify differences and their owners.
3. Name the shared concept in domain terms.
4. Sketch call sites and count the concepts a reader must learn.
5. Reject designs that require mode flags, unused extension points, or leaked
   implementation options.
6. Verify behavior through the public contract.

When evidence is incomplete, keep concrete code.

When simplifying existing code:

- inline helpers that only rename syntax or forward arguments;
- collapse layers with the same owner that change together;
- replace configurable universal abstractions with explicit use-case variants
  when options encode separate behaviors;
- remove interfaces, factories, adapters, and types that no longer protect a
  boundary or invariant;
- preserve useful domain names when removing their machinery; and
- keep the change proportional; do not rewrite unrelated consumers to remove a
  small local cost.

Removing an abstraction is an improvement when the result is more direct and no
important contract is lost.
