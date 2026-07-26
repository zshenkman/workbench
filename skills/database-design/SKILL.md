---
name: database-design
description: Create or revise a complete target-state database catalog specification for a new proposal or existing application, starting from required product features and tracing them into every schema, table, column, constraint, index, function or RPC, view, relationship, important user-action chronology, and data pipeline, with focused Mermaid diagrams. Use when designing a relational database, turning product requirements and implementation evidence into an ideal schema contract, documenting intended backend behavior, or auditing a database specification for completeness.
---

# Database Design

Produce one authoritative Markdown specification that a capable newcomer can use
to understand and implement the database without reconstructing decisions from
application code.

## Hold the design bar

Treat completeness as coverage, not volume. A good catalog says every necessary
thing once, in the place a reader expects, and introduces no database machinery
merely to make the document look thorough.

Make the schema explain itself first:

- choose names that reveal domain meaning and ownership;
- use types, nullability, defaults, constraints, and relationships to encode
  invariants directly;
- keep one canonical representation of each fact and cross-reference it instead
  of copying prose between sections;
- state global conventions once and keep object-specific decisions beside the
  object they govern;
- use short tables for repeated exact facts, prose for non-obvious reasoning,
  and diagrams only for relationships or chronology that are harder to follow
  linearly;
- label uncertainty as `TBD`; do not hide it behind generic wording.

Make every moving part earn its place. A table, index, view, materialized view,
function, trigger, policy, partition, extension, queue, cache, denormalized
field, pipeline, or diagram must have:

1. a concrete invariant, access pattern, security boundary, or operational need;
2. a required product feature or cross-cutting requirement it supports;
3. evidence from requirements, workload, or the implemented system;
4. a reason a simpler shape or mechanism is insufficient;
5. one clear owner;
6. a failure cost and, for costly or provisional parts, a review or removal
   trigger.

Omit a mechanism when those answers are missing. Prefer a constraint over prose,
one atomic statement over distributed coordination, one well-chosen index over
overlapping indexes, and a direct relationship over a synchronization path.
Prefer fewer concepts, states, owners, and background processes when they satisfy
the same requirements.

Do not confuse database ownership with sophistication. Keep behavior in the
database when it protects shared integrity, atomicity, authorization, or
data-local performance. Keep it in an application or worker when it coordinates
external systems or product behavior without needing a database invariant.
Document the boundary either way.

## Start from the template

Read `templates/catalog.md` in full. Copy it to the user's requested
location, or to `docs/database-catalog.md` when the project has no established
documentation location. Preserve its section order unless project conventions
require another structure. Replace or remove every bracketed instruction and
placeholder before finishing.

Do not edit the bundled template while creating a project catalog.
Remove inapplicable optional rows and subsections rather than filling the catalog
with repeated `Not applicable` entries. Preserve mandatory inventories and
completeness checks so omissions remain visible.

## Establish scope and evidence

Read repository instructions first. Determine:

- database engine and installed version;
- migration, schema, ORM, generated type, seed, and database test locations;
- application entry points, services, jobs, queues, event handlers, webhooks, and
  analytics or integration pipelines that read or mutate cataloged data;
- naming, tenancy, authorization, soft-delete, audit, time-zone, identifier, and
  migration conventions;
- product entities, workflows, ownership boundaries, and retention needs.

Before choosing, preserving, or reviewing any database name, read
`rules/naming.md` and `rules/database-naming.md` in full. Treat them as normative:
`naming.md` governs semantic accuracy and `database-naming.md` applies that
authority to schemas, tables, columns, keys, constraints, indexes, queries, and
migrations.

Use one domain term per concept across the catalog, database, and application
unless a boundary mapping is deliberate and documented. Preserve an established
convention only while it remains accurate. Because the catalog describes the
ideal target state, replace misleading, ambiguous, storage-shaped, or
transition-shaped names with the clearest domain name without narrating the
rename in the catalog.

## Start from product capabilities

Define the product features the target database must support before choosing
schemas, entities, tables, or services. Treat this feature map as the source of
truth for the rest of the architecture.

Describe a feature as a stable user or business capability with an actor and
outcome, not as a screen, endpoint, ticket, or proposed database mechanism.
Assign each feature a stable ID such as `F-001`. For every feature, record:

- primary actors and intended outcome;
- commands, queries, state transitions, and important failure cases;
- data the database must own, read, derive, retain, or delete;
- domain invariants and authorization boundaries;
- scale, latency, consistency, availability, privacy, audit, and retention
  requirements that can affect architecture;
- which responsibility belongs in the database and which belongs in the
  application, a worker, or an external system.

State **No database responsibility** when a feature needs no persistence or
database-enforced invariant. Do not invent storage merely to make every feature
map to a table.

Capture cross-cutting requirements such as tenancy, identity, billing, audit,
privacy, search, analytics, and retention once, then reference every affected
feature. Derive a short set of architecture drivers from the feature map. Each
driver must cite its feature or cross-cutting requirement IDs and state the
database consequence it creates.

Do not begin the object catalog until the in-scope feature map is explicit enough
to guide ownership, boundaries, data shape, access patterns, and operational
needs. Mark unresolved product behavior `TBD`; do not settle it indirectly with
schema choices.

Maintain bidirectional traceability:

- every table, routine, view, policy, pipeline, and non-obvious index must cite a
  feature or cross-cutting requirement;
- every feature with a database responsibility must map to its user flows, data
  objects, invariants, and relevant architecture drivers.

An object with no requirement trace is a candidate for removal. A feature with
no data-responsibility trace exposes an incomplete design.

For an existing application, inspect executable schema definitions, applied
migrations, models, generated types, queries, tests, runtime flows, and docs as
evidence. Use them to recover real invariants, workload, consumers, and failure
behavior. Treat the current catalog as one design proposal, not the boundary of
what the target may become.

For a new design, derive the schema from confirmed requirements. Mark unresolved
decisions as `TBD` with the decision needed and its owner when known. Never invent
business rules merely to fill the template.

When the engine is PostgreSQL or Supabase, read
`references/postgres-rules.md` in full before designing or reviewing
the catalog. Apply its workload, indexing, RLS, concurrency, connection, and
maintenance requirements. For another engine, adapt only rules supported by that
engine and its documented behavior.

## Write only the target state

Describe one coherent ideal catalog that satisfies the known requirements with
the fewest justified moving parts. Apply this rule equally to a new proposal and
an existing application.

Never organize the catalog as a diff. Do not include:

- current-versus-target, before-versus-after, or old-versus-new columns;
- added, changed, removed, legacy, replacement, or migration-status labels;
- implementation progress by object;
- deprecated paths preserved only because they exist today;
- rollout phases, backfill steps, compatibility windows, or change history.

Use document maturity such as **Draft**, **Reviewed**, or **Approved** to describe
confidence in the target design. Maturity is not implementation status.

When the present implementation differs from the ideal shape, write the ideal
shape as canonical. Mention the mismatch only outside the catalog in the final
handoff, or create a separate audit or migration plan when the user requests one.
Never weaken, duplicate, or clutter the target catalog to encode transition work.
A compatibility object belongs in the catalog only when it remains part of the
intended steady state; describe its durable purpose without historical framing.

## Build the catalog

Work from the outside in:

1. Define in-scope product features and cross-cutting requirements.
2. Derive the architecture drivers and database responsibilities.
3. Define global conventions and database-wide assumptions.
4. Inventory every schema and object in scope.
5. Challenge non-obvious moving parts and record why each is necessary.
6. Map entities and cardinalities before detailing tables.
7. Derive workload and access patterns from product flows and known consumers.
8. Specify every table and its columns, constraints, indexes, policies,
   concurrency rules, and relationships.
9. Specify every function/RPC and view.
10. Trace common and important user actions through their backend effects.
11. Trace important ingestion, transformation, synchronization, and export
   pipelines through the cataloged objects.
12. Remove duplication and unjustified machinery, then run a target-state
    completeness pass against requirements and evidence.

Use fully qualified names whenever multiple schemas exist. Keep physical database
names exact, including case where the engine preserves it.

### Tables and columns

For every table, document:

- purpose, owner, lifecycle, and row-level meaning;
- expected scale, read/write mix, high-churn behavior, and partitioning decision;
- every column in declaration order;
- exact database type, including length, precision, scale, array dimensions, or
  domain where relevant;
- nullability, default, identity or generated expression, and semantic meaning;
- primary, unique, foreign key, check, exclusion, and other table constraints;
- foreign-key actions and whether constraints are deferrable;
- every explicit index and any important implicit index, including uniqueness,
  method, ordered keys or expressions, sort and null ordering, included columns,
  predicate, operator class, supported access pattern, and purpose;
- important query and mutation patterns, including filters, joins, ordering,
  pagination, batching, upsert/conflict targets, and expected frequency;
- grants, row-level security state and policies, policy-supporting indexes,
  privileged bypass paths, and sensitive-data handling;
- transaction scope, lock order, atomicity, idempotency, and queue-claim behavior
  for contended mutations;
- inbound and outbound relationships with exact cardinality, optionality, and
  whether the database enforces them.

Distinguish a missing value from an empty value. Record units, time zones, enum
meanings, money representation, identifier format, and sensitive-data class when
they affect correct use.

Do not claim that a foreign key is indexed unless the engine or schema actually
provides that index.

Design indexes from recorded access patterns. Prefer one justified composite or
partial index over disconnected single-column indexes when it matches the query.
Record the write/storage cost and do not add speculative indexes. In PostgreSQL,
index referencing foreign-key columns unless evidence shows the index is
unnecessary and record that exception.

### Functions and RPCs

For every database function or exposed RPC, document:

- qualified name, purpose, exposure, and authorization boundary;
- ordered parameters with modes, types, defaults, and meanings;
- exact return type or result columns;
- language, volatility or determinism, null-input behavior, and parallel-safety
  attributes when the engine supports them;
- invoker/definer security, owner, and controlled search path where applicable;
- reads, writes, transaction behavior, side effects, errors, and dependencies.

Flag security-definer routines or remotely callable mutation paths for explicit
review. Do not infer access control from naming.

### Views

For every regular or materialized view, document its purpose, output columns,
source objects, row-granularity, filtering or aggregation semantics, security
behavior, and consumers. For materialized views, also record refresh ownership,
method, cadence or trigger, concurrency behavior, and unique indexes required for
refresh.

## Trace behavior through the backend

Choose flows by evidence and consequence. Include the common paths that explain
normal system use and the important paths whose authorization, money movement,
data loss, privacy, fan-out, asynchronous work, or failure behavior deserves
explicit review. Typical candidates include onboarding, creation of the primary
domain object, permission changes, state transitions, deletion, imports,
webhooks, notifications, billing, and reporting. Include only applicable flows.

For each user-action flow, document:

- actor, trigger, preconditions, and authorization decision;
- chronological request, service, function/RPC, transaction, and asynchronous
  steps;
- tables, columns, views, and functions read or written at each step;
- transaction boundaries, locks, validation, emitted events, jobs, and external
  side effects;
- user-visible result, consistency window, and important failure or retry paths.

For each data pipeline, document:

- source, trigger or schedule, owner, destination, and business purpose;
- ordered ingestion, validation, transformation, deduplication, storage, and
  publication stages;
- object-level reads and writes, mapping or aggregation rules, and data
  classification changes;
- batching or streaming model, idempotency key, checkpoint or cursor, retry and
  dead-letter behavior, and backfill or replay method;
- freshness target, observability, failure impact, and recovery owner.

Use an impact register to connect each step to exact backend objects and effects.
Do not stop at component names such as "API" or "worker." Show the persistent
state change, query, routine, event, or external side effect behind the component.
State `TBD` where the flow exposes an unresolved backend contract.

## Use Mermaid deliberately

Include an `erDiagram` showing all cataloged tables and their direct
relationships. Split it into bounded-context diagrams when one diagram becomes
hard to scan, and add a small cross-context diagram so no relationship disappears.

Use relationship labels that name the business meaning. Derive cardinality and
optionality from constraints, not intuition. Show junction tables as entities.
Do not use Mermaid as the only record of a relationship; repeat exact foreign-key
details in the table catalog. Include intentional logical relationships that
lack a foreign key, label them as unenforced, and explain where their integrity
is maintained.

Use a `sequenceDiagram` for the chronology of each selected user action. Show the
actor, backend boundaries, synchronous calls, transaction or commit point,
asynchronous handoff, and user-visible response. Use notes or the accompanying
impact register for exact reads and writes instead of crowding messages.

Use a `flowchart` for each selected data pipeline and for cross-object dependency
or write/read paths that are clearer as a graph. Distinguish sources,
transformation or validation stages, durable stores, queues, sinks, and failure
routes. Label asynchronous edges and trust or ownership boundaries when they
matter.

Keep SQL expressions, long types, and detailed constraints in tables rather than
diagram labels. Prefer Mermaid-safe aliases for qualified names and label nodes
with the real database names. Ensure every diagram is supported by a written
contract; diagrams illustrate the catalog but do not replace it.

## Check completeness

Before finishing:

- confirm every in-scope product feature has an actor, outcome, database
  responsibility, critical invariants, quality requirements, and architecture
  driver where needed;
- confirm every feature with a database responsibility maps to its flows and
  catalog objects, and every catalog object maps back to a feature or
  cross-cutting requirement;
- compare the target object inventory with confirmed requirements and source
  evidence; do not carry forward current-only objects without a target need;
- confirm that every table has one table section and every column appears once;
- confirm every constraint and index is attached to its owning table;
- confirm every important access pattern maps to a suitable index or an explicit
  reason for a sequential scan, and every index names the pattern it supports;
- confirm PostgreSQL foreign keys and RLS predicate columns have suitable indexes
  or documented exceptions;
- confirm both sides of every foreign key agree on columns, cardinality, and
  delete/update behavior, and every unenforced relationship names its integrity
  owner;
- confirm every function/RPC and view has a signature or output contract and
  dependency list;
- confirm selected common and important user flows show chronology, backend
  object impacts, transaction boundaries, and meaningful failure paths;
- confirm selected data pipelines show lineage, object-level reads and writes,
  delivery semantics, recovery behavior, and ownership;
- confirm transaction and lock behavior is explicit for contended write paths;
- confirm roles, grants, RLS policies, privileged functions, connection pooling,
  maintenance, and query-plan verification are covered where applicable;
- confirm every non-obvious moving part has a concrete need, evidence, owner, and
  reason a simpler design is insufficient;
- confirm schemas, tables, columns, relationships, constraints, indexes, queries,
  units, temporal values, and lifecycle states follow the bundled naming rules
  and use one accurate term per concept;
- confirm no fact is maintained in multiple prose sections and no optional
  section remains as empty ceremony;
- confirm diagrams match the written catalog;
- resolve all placeholders, or convert genuine open decisions to explicit `TBD`
  entries;
- run available schema, SQL lint, or documentation checks when they can validate
  the target model without turning the catalog into an implementation report.

Report the catalog path, in-scope features, evidence used, target-design
maturity, important unresolved decisions, and checks run. For an existing
application, note material alignment concerns in the handoff without inserting
them into the catalog.
