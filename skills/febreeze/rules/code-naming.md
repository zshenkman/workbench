# Code Naming

Use this file for names in source code: values, functions, types, files, and
modules. Apply it with the domain vocabulary rules in `naming.md`. Follow local
language and framework conventions for casing and syntax unless they obscure
domain meaning.

## Variables and Values

- Name a value for its meaning at the current abstraction level, not how it was
  computed or stored.
- Use nouns for values and collections. Use an adjective only for a property in
  a narrow scope, such as `refundable`.
- Include meaningful validation or lifecycle state: `rawRequest`,
  `validatedOrder`, `pendingInvoice`, or `persistedAccount`.
- Include units when the underlying type could be confused:
  `retryDelayMilliseconds`, `contentLengthBytes`, or `amountCents`.
- Use plural nouns for collections. Name keyed collections by their lookup:
  `accountById` or `ordersByCustomerId`.
- Name a constant for its domain constraint. Include its literal type only when
  that prevents ambiguity.
- Do not encode temporary implementation details such as `array`, `string`,
  `database`, or `new` unless they are part of the value's meaning.

## Functions and Methods

- Start commands with a precise verb: `createInvoice`, `reserveInventory`, or
  `publishReport`.
- Name queries for their returned value: `findAccountByEmail`,
  `listOpenOrders`, or `calculateRefundTotal`.
- Use `find` when absence is expected and represented in the return type. Use
  `get` when the value is required or absence raises an error.
- Write predicates as true-or-false statements: `isExpired`, `hasPermission`,
  or `canIssueRefund`.
- Keep commands and queries distinct. A query name must not hide a material
  state change.
- Do not add `Async` only because a function returns a promise; the type
  expresses its execution model.
- Name public event props or registrations after the event, such as
  `onPaymentFailed`. When useful, distinguish the responding implementation as
  `handlePaymentFailed`.
- Avoid `handle`, `process`, `manage`, `execute`, and `run` when a precise
  domain verb exists.

## Types

- Name classes, interfaces, records, enums, and aliases with nouns for the
  concept they model.
- Do not prefix interfaces with `I` or types with implementation markers.
- Name a type for its contract, not its implementation. Prefer
  `InvoiceRepository` unless callers must select `PostgresInvoiceRepository`.
- Use role suffixes only when they add domain meaning. `Manager`, `Helper`,
  `Util`, `Service`, and `Processor` require a responsibility that cannot be
  named directly.
- Name state variants explicitly, such as `DraftInvoice`, `IssuedInvoice`, and
  `VoidedInvoice`, when their permitted operations differ.
- Use short generic type parameters only in a small, conventional scope.
  Otherwise name the role: `TRequest`, `TRecord`, or `TError`.
- Name error types for the failed condition, such as `AccountNotFoundError` or
  `InventoryUnavailableError`.
- Create a named type only for a stable concept, boundary, or invariant, not to
  give an incidental object shape a grander name.

## Files and Modules

- Name a file or module for its primary responsibility or exported concept.
- Align the primary export and filename where local convention uses one main
  export per file.
- Name a package for the capability it owns, not the team that created it or
  the technology it currently uses.
- Do not create catch-all `common`, `shared`, `helpers`, `utils`, or `misc`
  modules. Place behavior with its concept or name the narrower capability.
- Use index or barrel files only where the repository treats them as a public
  boundary. They must not hide ownership or create ambiguous imports.
- Name tests for observable behavior and the condition that causes it.

## Boundaries

- Make transformations visible at system boundaries. Distinguish transport
  input from validated domain input, and database records from domain models
  when their invariants differ.
- Use `Request` and `Response` only for actual request and response contracts.
- Use `Dto` only when the repository has established the term and it clarifies
  a transfer boundary.
- Keep vendor and protocol names inside the adapter that owns them.

## Renames

- Update every safely changeable use of a corrected name: declarations, uses,
  tests, public documentation, serialized fields, and observability labels.
- Preserve external compatibility unless the task includes a migration.
- Do not leave two active terms for one concept unless an alias serves a
  concrete compatibility need.
