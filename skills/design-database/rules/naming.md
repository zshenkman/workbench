# Naming

Use this rule whenever introducing or changing a name. It is the shared semantic
authority for specialized code and database naming rules; syntax conventions
must not misrepresent the domain.

## Priorities

Resolve tradeoffs in this order:

1. Represent the domain concept accurately.
2. Preserve established repository terminology when it remains accurate.
3. Make intent clear on a newcomer's first read.
4. Expose shape, ownership, units, or invariants when they affect correct use.
5. Keep names as short as the preceding requirements allow.

Prefer repository consistency, but change established terminology when it is
materially misleading, ambiguous, or inconsistent. Keep the rename proportional
to the task. Prefer safe use over brevity or immediate readability when omitting
a unit or invariant could cause incorrect behavior.

## Rules

- Name a domain concept after the concept, not its storage or implementation.
- Use one term per concept. Use different terms for concepts with different
  rules, owners, or lifecycles.
- Prefer familiar words over private jargon, clever shorthand, or vague
  placeholders.
- Spell out abbreviations unless they are both standard in the domain and
  established in the repository.
- Use nouns for values and verbs for actions.
- Write predicates as statements that can be true or false, such as `isExpired`,
  `hasAccess`, or `canRefund`.
- Use plural nouns for collections.
- Name maps and indexes by their lookup key: `accountById`,
  `usersByOrganizationId`.
- Include units when a number could be misread: `timeoutMilliseconds`,
  `sizeBytes`, `priceCents`.
- Name meaningful state distinctions, including raw versus validated input,
  persisted records versus drafts, and local versus server state.
- Avoid `data`, `info`, `item`, `object`, `result`, `handle`, `process`, and
  `manage` when a precise domain term is known.

Generic names are acceptable in a small scope when their meaning is immediate,
such as a short collection callback.

## Types and Invariants

- Use types to enforce important distinctions when they reduce total complexity.
- Introduce a named type or wrapper when it prevents invalid combinations,
  enforces an invariant, clarifies ownership or a system boundary, or gives a
  stable domain concept one shared name.
- Do not add an abstraction only to shorten a name, repeat information the
  language exposes, or generalize simple code.

## Comments

- Comment only when code cannot explain why a name, boundary, or constraint
  exists.
- Describe only the current canonical state. Do not record former names, removed
  implementations, migration history, or prior behavior.

```ts
// Billing closes at midnight in the customer's timezone.
const billingPeriodEnd = ...
```
