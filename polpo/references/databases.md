# Application Databases And The CLI

Check [contract-version.md](contract-version.md) first: this Data contract is unreleased.
The product calls a resource a **database**; API `/data`, SDK `data()` and custom-tool
`ctx.data` retain the generic Data namespace. Creating a database creates a logical resource
with a stable UUID and its declared tables. The PostgreSQL adapter uses one dedicated schema
per logical database, rather than provisioning an independent server for every resource.

## Administration

Use installed command help before executing these commands. All Data subcommands accept
`--project <id>` and `--url <url>`.

| Command | Input or behavior |
|---|---|
| `polpo data list` | List granted databases. |
| `polpo data describe crm` | Read schema and current `schemaVersion`. |
| `polpo data create create.json` | JSON `{name,schema}`; `schema.tables` declares tables and columns. |
| `polpo data migrate crm schema.json` | JSON `{expectedVersion,schema}`; additive changes only. |
| `polpo data execute crm batch.json` | JSON `{operations,idempotencyKey?}`; atomic typed record batch. |
| `polpo data query crm query.json` | JSON `{sql,params?,mode?,maxRows?,idempotencyKey?}`. |
| `polpo data migrate-sql crm migration.json` | Versioned SQL migration described below. |
| `polpo data migrations crm` | Applied migration IDs, checksums, versions and timestamps. |
| `polpo data rename crm customer_data --version 3` | Rename while preserving UUID and grants. |
| `polpo data delete crm --version 3 --confirm crm` | Delete the resource and its records; confirmation must repeat the exact reference. |

Read the current version before schema changes or deletion. For an identical retry, retain
the original expected version and idempotency key; changing the request requires a new key.
A `data_conflict` requires inspection, not an automatic overwrite.

Example `query.json`:

```json
{
  "sql": "UPDATE customers SET name=$1 WHERE _id=$2 AND _version=$3 RETURNING *",
  "params": ["Maria", "11111111-1111-4111-8111-111111111111", 1],
  "mode": "write",
  "idempotencyKey": "customer-name-change-42"
}
```

Read is the default SQL mode. The provider accepts a bounded PostgreSQL subset: logical table
names, parameterized values, SELECT/joins/aggregates/subqueries and explicit record mutations.
`query` does not accept DDL, catalogs, role changes or unrestricted SQL. Typed batches support
up to 100 operations; SQL responses return at most 200 rows. A truncated write result can
still represent a fully committed mutation; inspect `rowCount` and reuse the same key on retry.

Example `migration.json`:

```json
{
  "id": "customer_source",
  "expectedVersion": 1,
  "statements": [
    { "sql": "ALTER TABLE customers ADD COLUMN source text" },
    { "sql": "UPDATE customers SET source=$1", "params": ["import"] },
    { "sql": "ALTER TABLE customers ALTER COLUMN source SET NOT NULL" }
  ]
}
```

Migrations require administrative access and commit DDL, backfills, catalog version
and history atomically. Normal Polpo API keys provide that access within their existing
organization/project scope and environment; account sessions require owner/admin membership.
Supported DDL covers ordinary CREATE/ALTER/DROP TABLE and CREATE/DROP
INDEX within the logical database. Drops and type changes need `allowDestructive: true` in the
JSON. Defaults, triggers, custom types, cascading drops and arbitrary ORM migration SQL are
unsupported. `database_*` agent tools and `ctx.data` do not expose this administration.

## Hosting And Project Files

OSS provides contracts, PostgreSQL adapter, tools, HTTP, SDK and CLI. Self-hosting uses
`POLPO_DATA_DATABASE_URL` for a separate application database whose owner has `CREATEROLE`;
without it, Data is unavailable. For CLI calls use a server-side `POLPO_API_KEY` with
`--url http://localhost:3890/api`. The CLI appends `/v1/data`; do not add `/v1` again to that URL.

Cloud provisions the managed application database on Neon and keeps provider credentials.
Applications call Polpo's API using their normal Polpo key with full Data access
inside its existing organization/project scope. Live and Test keys select separate
Data environments; the CLI does not invent an `--environment` flag. The managed feature must
also be enabled by the host rollout configuration. Resources sharing a Neon branch share
compute and backup/restore lifecycle; do not promise independent per-resource restore.

There is no agent `data` field or `data/` subdirectory. Agent policy may select `database_*`,
while trusted host configuration owns grants. `polpo deploy` and resource pull do not apply
migration files or synchronize schemas, records or grants. Keep migration JSON in the
application repository when useful, then apply it through an explicit administrative step.

The self-hosted dashboard exposes **Databases** at `/data`: Schema and table selection, records,
SQL query/mutation and migrations/history. It uses the configured runtime backend,
without Cloud Live/Test or Neon provisioning controls. OSS agent grants remain
host configuration; the dashboard does not simulate Cloud grant endpoints.

The remote Cloud MCP and builder expose `polpo_databases_*` administration tools
using the signed-in account, explicit `projectId` and optional `environment`
(default `live`). Use query for SQL reads, mutate for record writes and migrate
for SQL schema changes. These account tools are distinct from the agent's
grant-limited `database_*` tools; existing OAuth read/write permissions apply.
