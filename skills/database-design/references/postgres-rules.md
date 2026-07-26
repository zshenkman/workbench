# PostgreSQL catalog quality rules

Apply these rules when the target is PostgreSQL or Supabase. They are adapted
from Supabase Postgres Best Practices v1.1.1. Use them to decide what the catalog
must explain and verify; do not add database objects without workload evidence.

## Contents

1. Catalog structure
2. Schema and type decisions
3. Access patterns and indexes
4. Security and row-level security
5. Transactions and concurrency
6. Data access and pipelines
7. Connections and runtime configuration
8. Monitoring and maintenance
9. Completion criteria

## 1. Catalog structure

Make each physical design choice traceable:

```text
product flow
  → query or mutation pattern
  → expected scale and frequency
  → constraint, index, policy, or transaction design
  → verification and operational owner
```

For each table, keep the following together:

- row meaning, lifecycle, expected row count, growth, and read/write mix;
- exact columns and constraints;
- representative reads and mutations;
- indexes mapped to those access patterns;
- RLS policies and grants mapped to roles;
- transaction, lock, idempotency, and contention behavior;
- partition, vacuum/analyze, retention, and monitoring decisions.

Do not call a catalog optimized solely because it contains many indexes. Optimize
for observed or expected access paths while accounting for write amplification,
storage, maintenance, and operational complexity.

Keep the design lean:

- prefer a native constraint to a trigger that reimplements the invariant;
- prefer a direct query with a justified index to a view, cache, or duplicated
  table when it meets the requirement;
- prefer a normal view to a materialized view until measured cost justifies
  refresh, staleness, storage, and failure machinery;
- prefer an atomic SQL statement or constraint to advisory locks and distributed
  coordination;
- prefer typed columns and normalized relationships to opaque JSONB or
  denormalized copies unless variable shape or measured access needs justify
  them;
- reject overlapping indexes unless each supports a distinct proven access path;
- avoid extensions, partitions, triggers, privileged functions, and background
  jobs without a named owner and operational need.

Record a review or removal trigger for provisional optimizations. Distinguish
verified measurements from unverified target hypotheses without describing
implementation progress or a current-to-target delta.

## 2. Schema and type decisions

- Use unquoted lowercase `snake_case` identifiers. Record unavoidable quoted
  legacy names exactly.
- Use types that encode semantics: `bigint` for durable sequential identifiers,
  `text` unless a string length is a real constraint, `timestamptz` for instants,
  `boolean` for flags, and `numeric(precision, scale)` for exact money.
- Prefer `bigint generated ... as identity` for a single-database primary key.
  For distributed or exposed identifiers, prefer a time-ordered UUID such as
  UUIDv7 or another justified sortable identifier. Record required extensions.
- Avoid random UUID primary keys on large write-heavy tables unless their
  distribution or privacy benefit outweighs index fragmentation.
- Express domain invariants with primary, unique, foreign-key, check, exclusion,
  enum, or domain constraints. Give every constraint a stable name.
- Record how migrations add or validate large constraints safely. PostgreSQL has
  no `ADD CONSTRAINT IF NOT EXISTS`; idempotent migrations must inspect the
  catalog or use another supported project pattern.
- Index the referencing side of foreign keys for joins and cascade operations.
  PostgreSQL does not create these indexes automatically.
- Consider range partitioning for very large or time-series tables, especially
  around 100 million rows or when retention requires efficient partition drops.
  Record partition key, bounds, creation, pruning queries, retention, and the
  owner of future partition creation.

## 3. Access patterns and indexes

List important queries before designing indexes. For each pattern, record:

- consumer and purpose;
- predicates, joins, selected columns, order, limit, and pagination cursor;
- expected cardinality, frequency, latency target, and data distribution;
- chosen index or why a sequential scan is appropriate;
- representative `EXPLAIN (ANALYZE, BUFFERS)` evidence when available, otherwise
  an explicitly unverified target hypothesis.

Apply these index rules:

- Index columns used in frequent selective filters and joins.
- Put equality keys before range or ordering keys in a composite B-tree index.
  Record the leftmost-prefix queries the index can and cannot support.
- Use `INCLUDE` for projected columns only when an index-only scan is valuable
  enough to justify the larger index.
- Use a partial index when queries repeatedly use the same selective predicate,
  such as active rows or a pending state.
- Choose the access method and operator class from the operators: B-tree for
  equality/range/order, GIN for arrays/JSONB/full text, GiST for ranges,
  geometry, or nearest-neighbor work, and BRIN for large naturally ordered data.
- For JSONB, record queried keys and operators. Use GIN for containment or an
  expression index for a frequently queried scalar path. Record `jsonb_ops`
  versus `jsonb_path_ops` intentionally.
- For full-text search, record the generated `tsvector`, language/configuration,
  weighting, GIN index, query operators, and ranking behavior.
- Avoid duplicate or speculative indexes. Record storage/write cost and the
  index owner or review condition for expensive indexes.

## 4. Security and row-level security

Document privileges as an explicit matrix of role × object × operation. Grant
only required schema usage, table actions, sequence usage, and function
execution. Record revoked defaults; application connections must not use a
superuser.

For every tenant- or user-owned table:

- state whether RLS is enabled and forced;
- list every policy name, command, roles, `USING` expression, and `WITH CHECK`
  expression;
- explain how the caller identity or tenant context enters the database;
- identify owner, service-role, or security-definer bypasses;
- index columns used by policy predicates and joins;
- test allowed and denied reads and writes for each affected role.

Avoid per-row evaluation of stable identity helpers when PostgreSQL can evaluate
a scalar subquery once. For complex policy lookups, a security-definer helper
may be appropriate, but place it in a non-exposed schema, set an empty or fixed
search path, check the caller identity inside the function, and revoke execution
from roles that do not need it. Flag every such helper for security review.

## 5. Transactions and concurrency

- Keep transactions short. Perform slow external calls outside a transaction;
  hold locks only for the database work that needs atomicity.
- Record the commit point and user-visible state for important mutations.
- Use predicates or versions for conditional state transitions and document the
  conflict result.
- Acquire locks in a consistent order. Record that order for workflows touching
  multiple rows or tables.
- Prefer one atomic statement over a read-then-write sequence when possible.
- Use `INSERT ... ON CONFLICT` for atomic insert-or-update behavior and record
  the exact unique conflict target.
- Use transaction-scoped advisory locks for application coordination only when
  row constraints or locks cannot express the invariant. Document lock key,
  scope, timeout, and failure behavior.
- For database-backed worker queues, use an atomic claim with `FOR UPDATE SKIP
  LOCKED` when parallel workers must avoid blocking. Document lease/ownership,
  retry, stale-job recovery, and terminal failure behavior.
- Set relevant statement, lock, and idle-in-transaction timeouts; document where
  configuration is owned.

## 6. Data access and pipelines

- Batch related inserts; use multi-row `INSERT` or `COPY` for bulk ingestion.
  Record batch size, transaction scope, validation, and partial-failure handling.
- Avoid N+1 access. Record the batched join, array lookup, or loader used by a
  flow that fetches related rows.
- Prefer cursor/keyset pagination for unbounded collections. Record all cursor
  columns, deterministic ordering, tie-breaker, comparison direction, and
  supporting composite index.
- For pipelines using upsert, document the conflict key, update behavior,
  idempotency, and whether replay can overwrite newer values.
- Record data lineage, schema version, checkpoint/watermark, deduplication,
  dead-letter route, backfill/replay, freshness, and data-quality checks.

## 7. Connections and runtime configuration

Record how each application or job reaches PostgreSQL:

- pooler and mode (`transaction` or `session`);
- pool size, role, connection limit, and reserved administrative capacity;
- prepared-statement behavior compatible with the selected pool mode;
- idle session and idle-in-transaction timeouts;
- relevant `statement_timeout`, `lock_timeout`, and workload-specific settings.

Use transaction pooling for most request/response workloads. Document any need
for session pooling, such as session-scoped state, temporary tables, or named
prepared statements. Size connection and memory settings from deployment
resources rather than copying a fixed value.

## 8. Monitoring and maintenance

- Enable and own `pg_stat_statements` when available. Track frequent,
  high-total-time, and high-mean-time queries.
- Capture representative `EXPLAIN (ANALYZE, BUFFERS)` plans for critical queries
  using safe non-production data or an approved production procedure.
- Record autovacuum/analyze behavior for high-churn tables. Tune table-specific
  scale factors only with evidence.
- Monitor deadlocks, lock waits, connection saturation, slow queries, dead
  tuples, vacuum/analyze recency, index use, pipeline lag, and dead-letter volume.
- Define the review trigger for repartitioning, adding or removing an index, or
  changing a query contract as data volume and distribution change.

## 9. Completion criteria

A PostgreSQL catalog is not complete until:

- every important query and mutation maps to a physical design decision;
- every index identifies its access pattern and applicable operators;
- every foreign key and RLS predicate has a suitable supporting index or a
  documented exception;
- every role, grant, policy, and privileged bypass is explicit;
- contended flows state transaction boundaries, lock order, idempotency, and
  retry behavior;
- connection pooling, timeouts, query diagnostics, and table maintenance have
  owners;
- unverified performance claims are labeled as target hypotheses, while verified
  claims cite measurements or plans.

Source: Supabase Postgres Best Practices v1.1.1 (MIT), especially the `schema-*`,
`query-*`, `security-*`, `lock-*`, `data-*`, `conn-*`, `monitor-*`, and
`advanced-*` rules.
