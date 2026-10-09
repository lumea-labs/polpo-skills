# Agent Access To Application Databases

Check [contract-version.md](contract-version.md) first: this Data contract is unreleased.
Databases contain application tables and records, separate from personal Memory, project
Knowledge and file Volumes. The PostgreSQL adapter maps one logical database to a dedicated
schema; this is not a new server or an agent-owned filesystem directory.

## Configure Policy And Grants

An agent enables exact tools or `database_*` in `.polpo/agents/<name>/agent.json`:

```json
{
  "allowedTools": ["database_list", "database_describe", "database_read", "database_query"]
}
```

This is a tool policy ceiling, not a database permission grant. In addition, the trusted host
must grant the agent `read` and/or `write` on a resource UUID, optionally limited to tables.
Cloud stores these grants administratively. OSS reads host-owned `POLPO_DATA_AGENT_GRANTS`:

```json
{
  "support": [{
    "resource": "11111111-1111-4111-8111-111111111111",
    "tables": ["customers"],
    "actions": ["read"]
  }]
}
```

Do not place grants, provider credentials or that environment variable inside `agent.json`
or model arguments. A read-only agent with `database_query` still cannot mutate records:
write mode and write grants are both required. Selecting tool names alone never widens grants.

## Nine Built-in Tools

| Tool | Meaning |
|---|---|
| `database_list` | List accessible logical databases. |
| `database_describe` | Inspect permitted table definitions and schema version. |
| `database_read` | Typed filters, ordering and pagination for one table. |
| `database_insert` | Insert a record. |
| `database_update` | Update a record using `_id` and expected `_version`. |
| `database_delete` | Delete a record using `_id` and expected `_version`. |
| `database_upsert` | Insert or update through a populated declared unique key. |
| `database_transaction` | Atomic batch of structured record operations, up to 100. |
| `database_query` | One scoped SQL read or explicit record mutation. |

`database_transaction` is not a SQL query tool. `database_query` supports the provider's bounded
SQL subset for joins, aggregates and subqueries, using unqualified logical table names and
`$1` parameters. Every referenced table, including nested queries, must be granted. It defaults
to read mode and 20 returned rows, with a maximum of 50; mutations require `mode: "write"`.
SQL updates advance revisions automatically, but callers must add `WHERE _version = ...` when
optimistic concurrency is needed. Reuse a write idempotency key only for the same request.

Neither `database_delete` nor any other agent tool drops a database. Creation, schema changes,
SQL migrations and database removal remain administrative API/SDK/CLI/dashboard operations.
Custom tools receive the same record permissions through `ctx.data`, with no DDL capability.

## Directory And Runtime Boundaries

There is no `data` field or `data/` subdirectory in an agent definition. Agent directories
contain instructions and static tool policy; database resources and grants remain host-owned.
Project deployment and pull do not synchronize database schemas, records, migrations or grants.

Grant revocation applies to subsequent operations, including cached agents and isolated custom
tools. In Cloud, request-scoped execution uses the authenticated Live/Test environment;
durable project tasks and schedules use Live. Sandbox Data capabilities expire within 31
minutes; a longer task needs a new run to obtain renewed access. Data does not implement
application user authentication or per-user row rules.
