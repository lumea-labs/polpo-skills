# Application Data Through The SDK And API

Check [contract-version.md](contract-version.md) first: this Data contract is unreleased.
Data holds application records independently from Polpo runtime state and file Volumes. A
logical database has a stable UUID, named tables and `schemaVersion`; the current PostgreSQL
provider maps it to a schema. Public names are Databases, API `/data` and SDK `.data()`.

## Typed Records

Use a configured server-side Polpo SDK client and least-privilege Data grants:

```ts
const database = client.data("crm");
const customers = database.table("customers");
const page = await customers.list({ limit: 25, filter: { email: { eq: "maria@example.test" } } });
const row = await customers.insert(
  { name: "Maria", email: "maria@example.test" },
  { idempotencyKey: "customer-create-42" },
);
const updated = await customers.update(row._id, { name: "Mario" }, row._version);
```

Rows include immutable `_id`, monotonic `_version`, `_created_at` and `_updated_at`. Columns
support text, signed 32-bit integer, finite number, boolean, timestamp, UUID and JSON. Text is
bounded to 64 KiB UTF-8; numbers and timestamps must be finite. Inspect the schema before
constructing values. Typed update/delete requires the expected row version; reload and resolve
conflicts rather than overwriting automatically. Upsert requires a declared populated unique
key. `database.transaction(operations, {idempotencyKey})` executes up to 100 typed operations
atomically. List pages default to 50 rows (maximum 200), with offsets bounded to 10,000.

## Scoped SQL

```ts
const result = await database.query({
  sql: "SELECT customer, sum(amount) AS total FROM orders GROUP BY customer",
  maxRows: 100,
});
await database.query({
  sql: "UPDATE customers SET name=$1 WHERE _id=$2 AND _version=$3 RETURNING *",
  params: ["Maria", updated._id, updated._version],
  mode: "write",
  idempotencyKey: "customer-rename-42",
});
```

Read is the default mode. PostgreSQL supports a bounded subset: SELECT, joins, aggregates,
subqueries, UNION/VALUES and explicit INSERT/UPDATE/DELETE/ON CONFLICT. Use logical table names
and bound scalar parameters; every referenced table needs its operation's grant. Catalogs,
other schemas, session/role commands, procedural SQL, CTEs, arbitrary functions and unrestricted
ORM SQL are unsupported. Bind numeric parameters rather than scientific SQL literals.

SQL generates IDs and advances revisions automatically. It does not insert a concurrency
predicate on the caller's behalf: zero affected rows can mean an expected version no longer
matches. Results contain `rows`, `rowCount`, `truncated`; read counts cover returned rows, while
write counts cover every affected row. Returned rows default to 200 and cannot exceed 200.
A truncated result does not imply a partially committed write. Requests are capped at 256 KiB
and results at 1 MiB; result overflow rolls back writes. Reuse an idempotency key only for the
exact request, including after uncertain transport failures. Providers without SQL fail with
`data_invalid`; typed records remain the portable interface.

## Administrative Schema Lifecycle

Only trusted administrative clients with `manage` grants can create or change databases.
`client.createData({name,schema})` creates one; `database.describe()` yields its current version.
`database.migrate({expectedVersion,schema})` supports additive schema evolution. For ordered SQL
DDL and backfills:

```ts
const current = await database.describe();
await database.migrateSql({
  id: "customer_source",
  expectedVersion: current.schemaVersion,
  statements: [
    { sql: "ALTER TABLE customers ADD COLUMN source text" },
    { sql: "UPDATE customers SET source=$1", params: ["import"] },
    { sql: "ALTER TABLE customers ALTER COLUMN source SET NOT NULL" },
  ],
});
const history = await database.migrations();
```

Supported DDL covers ordinary CREATE/ALTER/DROP TABLE and CREATE/DROP INDEX, portable column
types and NOT NULL/UNIQUE/REFERENCES constraints. Defaults, triggers, custom types and cascading
drops are unsupported. Drops/type changes require `allowDestructive: true`. Schema, backfills,
catalog version and history commit together. Retry an identical migration ID with its original
expectedVersion; a changed request conflicts. A new migration reads the current version.
`database.rename({expectedVersion,name})` retains the UUID; `database.remove(expectedVersion)`
deletes the database and its records. Neither operation is an ordinary record tool.

## HTTP And Trust Boundaries

Paths below are relative to `/v1` in Cloud or `/api/v1` on the standard self-hosted Node server:

| Method | Path |
|---|---|
| GET / POST | `/data` |
| GET / PATCH / DELETE | `/data/:resource` (DELETE needs `?expectedVersion=N`) |
| PUT | `/data/:resource/schema` |
| POST | `/data/:resource/transactions` |
| POST | `/data/:resource/query` |
| GET / POST | `/data/:resource/migrations` |

Cloud application servers receive scoped Polpo keys, never Neon credentials. A Data-only key
cannot access unrelated Polpo APIs; Live and Test keys select separate Data environments.
Keep credentials server-side. Application user authentication and per-user row rules belong
to the application; Data does not provide an end-user auth model.

Agents have nine built-in `database_*` tools: list, describe, read, insert, update, delete,
upsert, transaction and query. Their SQL query tool defaults to 20 rows, capped at 50.
Custom tools receive `ctx.data.list/describe/execute` and optional `query` with the same grants.
These capabilities expose records, not schema administration. Agent directories have no `data`
field or subdirectory, and project deploy/pull does not apply schemas, migrations, records or
grants. Use an explicit administrative SDK/API/CLI step in the application's deployment flow.
