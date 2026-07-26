# Scaffolding

Use this rule when creating or restructuring files, modules, packages, features,
or architectural boundaries. It governs ownership and composition; use
`naming.md` and `code-naming.md` for names within that structure.

## Follow the Existing System

Before adding structure:

1. Find the nearest feature with similar responsibilities.
2. Identify its entry points, dependency boundaries, test placement, and file
   conventions.
3. Determine which existing module owns the new behavior.
4. Add a boundary only for distinct ownership, dependencies, invariants, or
   demonstrated reuse.

Preserve a clear established pattern. Do not introduce a second pattern merely
because it is familiar from another repository.

## Organize by Ownership

- Group files by the capability or feature that changes them together. Avoid
  top-level organization by technical kind when it scatters feature ownership.
- Keep private implementation and, when repository conventions allow, its
  tests, fixtures, styles, schemas, and small supporting types near its owner.
- Separate transport, persistence, framework, and vendor details from domain
  behavior at boundaries that translate them.
- Give shared code an explicit owner and contract. Names such as `shared`,
  `common`, and `utils` do not establish ownership.
- Move code to a broader shared location only when multiple real consumers need
  the same contract.
- Do not duplicate a domain type across a boundary unless a transformation or
  invariant distinguishes the two types.

## Define Boundaries and Dependency Direction

- Deliberately define each module's public surface. Do not export private files
  for convenience.
- Depend on the smallest stable contract that expresses the consumer's needs.
- Keep policy independent of delivery and storage details. Adapters may depend
  on domain contracts; domain behavior must not depend on a specific adapter.
- Pass dependencies through an explicit construction boundary when callers
  must substitute implementations. Do not use a container that hides required
  dependencies.
- Hide state management behind the contract consumed by composed parts. Expose
  whether state is local, persisted, cached, or synchronized only when that
  distinction changes the contract.
- Avoid circular dependencies. If modules require each other's private details,
  revisit ownership before extracting another abstraction.
- Use an entry-point file only for a meaningful public API. Do not use barrels
  that hide dependency direction or make internal files public.
- Do not add pass-through wrappers without policy, translation, or a stable
  contract.

For example, domain behavior should accept its contract while the composition
root selects the implementation:

```ts
interface OrderRepository {
  save(order: Order): Promise<void>
}

function createOrderService(repository: OrderRepository) {
  return async (input: CreateOrderInput) => {
    const order = createOrder(input)
    await repository.save(order)
    return order
  }
}
```

## Compose Capabilities

- Build larger behavior from focused parts whose contracts make valid
  combinations clear.
- Prefer explicit variants or discriminated types over independent mode flags.
  Compose each variant from the parts it needs instead of branching throughout
  one configurable parent.
- Use a shared context, coordinator, or service contract when related parts
  need the same state and actions. Keep its implementation at the provider or
  construction boundary.
- Lift shared state to the nearest owner that coordinates all consumers, not
  beyond it for global convenience.
- Prefer direct structural composition for fixed parts. Use a callback, render
  function, strategy, or plugin only when the parent must provide data or
  control invocation.
- Let one-off variants remain explicit. Sharing internal pieces does not require
  one universal public abstraction.
- Do not create abstractions or extension points for hypothetical variations.

For mutually exclusive behavior, expose variants rather than flag combinations:

```ts
const createPreviewExporter = (dependencies: ExportDependencies) =>
  composeExporter(dependencies, [validateDraft, renderPreview])

const createPublishedExporter = (dependencies: ExportDependencies) =>
  composeExporter(dependencies, [
    validatePublication,
    renderDocument,
    persistExport,
  ])
```

## Keep Responsibilities Cohesive

- Give each file one recognizable reason to change.
- Keep tightly related definitions together when splitting would hide the
  concept or add navigation without clarifying ownership.
- Split distinct policies, independent boundaries, or parts that change for
  different reasons. File size alone is not a reason to split.
- Do not mechanically create one file per function, class, or type.
- Do not create placeholder directories, empty modules, speculative base
  classes, or unused extension points.
- Keep configuration declarative. Put orchestration and side effects in code
  with an owner and a testable boundary.
- Keep generated files visibly derived and separate from canonical sources.
  Never hand-edit generated output.

## Own State and Side Effects

- Assign each mutable value one owner. Expose only the state, actions, and
  metadata collaborators require.
- Keep side effects at explicit boundaries and make their order observable.
- Do not synchronize duplicate state through callbacks, events, or effects when
  one shared owner can hold it.
- Do not use global registries or reach through references to control another
  module's private state.
- Make initialization, cleanup, retries, and partial failure the responsibility
  of the boundary that owns the side effect.

## Test Observable Contracts

- Place tests where a newcomer will look for the behavior they verify.
- Test through the owning module's public contract. Do not expose production
  internals solely for direct testing.
- Add focused integration tests where composition, adapters, or generated
  resources can fail.
- Keep test-only builders and fixtures near their consumers until a stable
  shared test contract emerges.
