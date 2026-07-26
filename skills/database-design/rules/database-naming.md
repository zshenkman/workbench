# Database Naming

Use this rule to name relational schemas, tables, columns, keys,
constraints, indexes, queries, and migrations. Apply it with `naming.md`.
Preserve an established database convention while it remains accurate. For a
new schema, use lowercase `snake_case` identifiers and one consistent
singular-or-plural table convention.

## Schemas and Tables

- Name schemas for their bounded domain or ownership boundary.
- Name tables for stored domain records, not an application class, screen, API
  route, or storage mechanism.
- Use the same domain term in code and the database unless a boundary mapping is
  deliberate and documented.
- Name association tables for both concepts, such as `account_roles` or
  `product_categories`.
- Qualify a table only when its domain term is ambiguous; do not repeat the
  schema name in every table.
- Do not encode environment, deployment, or temporary migration state in a
  canonical table name.
- Avoid `data`, `items`, `objects`, `entities`, and `records` unless the word is
  the actual domain concept.

## Columns

- Name each column for the single fact it stores.
- Use singular nouns for scalar values and plural nouns only for intentional
  collections.
- Name foreign keys for the referenced role or entity plus `_id`, such as
  `customer_id`, `billing_account_id`, or `approved_by_user_id`.
- Include units when the type does not make them unambiguous, such as
  `duration_seconds`, `size_bytes`, or `amount_cents`.
- Name instants with `_at`, calendar dates with `_on` or an established date
  term, and durations with their unit.
- Name booleans as true-or-false statements, such as `is_active`,
  `has_consented`, or `can_receive_email`.
- Use one status column instead of booleans for mutually exclusive lifecycle
  states.
- Avoid storage-type suffixes such as `_string`, `_int`, or `_json` unless the
  storage format is part of the domain contract.
- Use `created_at`, `updated_at`, and `deleted_at` only with their conventional
  meanings. Do not add lifecycle columns speculatively.

## Keys and Relationships

- Use stable keys. Use a mutable business attribute as a primary key only when
  its stability is a domain invariant.
- Preserve the schema's primary-key convention. In a new schema, use `id`
  consistently unless qualified keys materially improve joins or tooling.
- Enforce every domain uniqueness rule with an explicit unique constraint.
- When a table references the same table more than once, name each foreign key
  by role, such as `sender_account_id` and `recipient_account_id`.
- Prevent duplicate association-table relationships with a composite primary
  key or unique constraint unless duplicates have domain meaning.
- Express ownership through foreign-key location and delete behavior; do not
  imply cascade behavior through names alone.

## Constraints and Indexes

Use deterministic names that identify the object and relevant columns. Prefer
the established engine or migration-tool convention. Otherwise use:

- `pk_<table>` for primary keys;
- `fk_<table>_<column>` for foreign keys;
- `uq_<table>_<column_or_purpose>` for unique constraints;
- `ck_<table>_<condition>` for check constraints;
- `idx_<table>_<columns_or_purpose>` for indexes.

```sql
CONSTRAINT pk_order_items PRIMARY KEY (id)
CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders (id)
CONSTRAINT uq_accounts_email UNIQUE (email)
CONSTRAINT ck_orders_total_nonnegative CHECK (total_cents >= 0)
CREATE INDEX idx_orders_customer_id_created_at
  ON orders (customer_id, created_at);
```

When identifier length is limited, shorten predictably while preserving the
table, relationship, and distinguishing columns. Use opaque hashes only when
tooling requires them.

## Time, Money, and Other Units

- Store instants in a timezone-aware type when supported. Name the event, such
  as `authorized_at`, rather than the storage type.
- Distinguish instants, local dates, local times, and durations in both name and
  type.
- Store money exactly. Include the unit when using minor units, and store
  currency when values may use more than one.
- Name range boundaries clearly. Prefer `starts_at` and `ends_at`, or domain
  terms with defined inclusivity, over numbered or ambiguous endpoints.

## Queries

- Name aliases for their concepts. Use short aliases only when the query remains
  immediately readable.
- Name common table expressions for their rows, such as `eligible_refunds` or
  `monthly_account_totals`, not their sequence.
- Name computed columns for their meaning and units.
- Align application query names with result and cardinality, such as
  `find_account_by_email`, `list_open_orders`, or
  `count_active_subscriptions`.
- Do not use `SELECT *` across a persistence or API boundary where added columns
  could silently change the contract.

Prefer:

```sql
WITH eligible_refunds AS (...)
SELECT payment_id, refundable_amount_cents
FROM eligible_refunds;
```

Avoid:

```sql
WITH temp1 AS (...)
SELECT p.*, amount AS value
FROM temp1 p;
```

## Migrations

- Name migrations for the schema operation and domain object, such as
  `add_currency_to_payments` or `create_order_items`.
- Keep a migration name truthful after implementation. For several inseparable
  operations, name the domain change they implement.
- Do not use vague names such as `update_schema`, `fix_database`, or `changes`.
- Treat renames as compatibility changes. Update queries, mappings, constraints,
  indexes, fixtures, and observability labels in the same migration plan.
