# Application Data In Custom Tools

Check [contract-version.md](contract-version.md) first: this Data contract is unreleased.
Use `ctx.data` for structured application records when the host has configured Data. It is
optional and scoped to the current agent, project and environment. A custom tool receives no
provider credentials and cannot construct new grants from model arguments.

## Capability Surface

| Method | Purpose |
|---|---|
| `ctx.data.list()` | Accessible logical databases and permitted table definitions. |
| `ctx.data.describe(resource)` | One database's visible schema and version. |
| `ctx.data.execute(resource, {operations,idempotencyKey?})` | Atomic typed record operations. |
| `ctx.data.query(resource, input)` | Optional provider SQL capability with the same grants. |

Check both `ctx.data` and `ctx.data.query` when SQL is required. A host capability wrapper may
expose the method while its underlying provider rejects SQL with `data_invalid`; do not infer
PostgreSQL support from the presence of a Data binding alone.

Inside a `defineTool` execution handler:

```ts
const data = ctx.data;
if (!data?.query) throw new Error("This host does not expose database SQL");
const result = await data.query("crm", {
  sql: "SELECT name, email FROM customers WHERE email=$1",
  params: [params.email],
  maxRows: 20,
});
return JSON.stringify(result);
```

Use bound `$1` parameters for values and granted logical table names. The PostgreSQL provider
accepts scoped SELECT/joins/aggregates/subqueries and INSERT/UPDATE/DELETE with explicit
`mode: "write"`. Every table reference is checked, including nested SQL. This is not an
unrestricted database connection: no catalogs, cross-schema access, session/role changes,
procedural SQL, CTEs or arbitrary functions. Numeric parameters avoid unsupported scientific
SQL literal syntax. Typed operations remain the portable interface for other providers.

Typed updates and deletes require `_id` and expected `_version`. SQL advances revisions but
requires an explicit version predicate when optimistic concurrency matters. Atomic batches
contain up to 100 operations. SQL results have `rows`, `rowCount` and `truncated`, capped at
200 rows; write `rowCount` includes every affected row even when the result page is truncated.
Requests are limited to 256 KiB and operation results to 1 MiB; a result-size failure rolls
back mutations. A write may commit before a network failure reaches the caller, so retry only
with the same idempotency key and exact request.

## Authorization And Execution

The host re-resolves grants on each operation. Agent `allowedTools` governs built-in tool
exposure; Data grants govern database/table access for both built-ins and custom tools. A
custom tool cannot gain schema administration by receiving a `manage`-looking argument.
`ctx.data` has no create, migrate, SQL-migrate or remove method; use administrative API/SDK/CLI
flows for that work, outside model execution.

`createRemoteDataClient` from `@polpo-ai/core/data` (also exported by `@polpo-ai/tools`) implements
the same capability over a trusted gateway. The host owns identity, grant revalidation,
capability expiry and transport credentials. Never pass gateway tokens or Neon/PostgreSQL
credentials through model-visible parameters. In-process custom tools remain trusted Node
code; `ctx.data` is not a sandbox for arbitrary code. Managed execution uses isolation.

Cloud keeps Neon credentials. Application servers use their normal Polpo API key with
full Data access inside its existing organization/project scope and bound environment.
That key's access does not replace or widen an agent's independent database grants.
Live/Test are separate Data environments; durable project tasks and schedules use Live.
Data itself supplies no application user authentication or per-user row authorization. Resolve
user identity and application rules in trusted application code; a model-provided user ID is
not an authorization decision. Do not use project deploy/pull as a database migration or
record/grant synchronization mechanism.
