# Development And Production

A project can have two environments, `development` and `production`. Each is a separate runtime
with its own state, database, files, sandbox, settings, Connections, and credentials. The same
`.polpo/` definitions are deployed to each one separately. Organization, members, and billing are
shared.

Requires CLI and SDK `0.17.3` or later, and a Cloud project that has been moved to environments.
CLI `0.17.3` and later always targets an environment, so it needs an environment key (or a
`mixed` key with `--prod`); see "Old Live/Test projects" below.

## CLI

Every project command defaults to **Development**. Production must be chosen on each command:

```bash
polpo deploy                     # Development
polpo deploy --prod              # Production
polpo deploy --env production    # same as --prod
polpo link --project-id <id> --prod
polpo data list --prod
```

`--prod` together with `--env development` is an error. Nothing is remembered between commands,
and `.polpo/project.json` stores no environment, so CI jobs that deploy to Production must pass
`--prod` explicitly. Do not pick the target from the Git branch, `NODE_ENV`, or the previous
command; ask the user when it is unclear. If Development is missing or its credential fails, do
not retry against Production.

The flags work on `deploy`, `create`, `link`, `cloud-status`, `cloud-logs`, `data`, `hooks`,
`runs`, `runtime`, `memory`, `connections`, `channels`, `tools`, `volumes`, `byok`, and `skills`.
Organization-level OAuth app commands are not per environment and reject the flags.

## What Deploy Moves

`polpo deploy` sends definitions only: agents, teams, skills, hooks, tools, Loops, missions,
playbooks, schedules, avatars. It does not copy model keys, vault credentials, Connections, or
learned memory between environments; configure those in each environment. `--include-tasks`,
`--include-sessions`, or `--all` also import task and session history, still without secrets or
memory. `polpo link` pulls definitions, not memory.

## Keys

A Polpo API key belongs to one environment and covers everything in it: agents, Data, files,
Connections, Channels. Data has no separate key.

- `polpo login --api-key <key>` reports which environment the key belongs to. A Production key
  still needs `--prod` on each command.
- `polpo link` reuses your logged-in key for that environment without writing anything. If it
  has to create a key, it writes `.env.local` when the file does not exist; otherwise it prints
  the new key in the terminal, so keep that output private.

## SDK, React, MCP

Clients do not default to Development: without an `environment` option they use whatever the key
and URL point to. Set it explicitly when it matters (see `polpo-runtime` and `polpo-react`). The
remote MCP server defaults to Development; use `/environments/production/v1/mcp` for Production.

## Self-Hosted

Run one server per environment, each with its own `WORK_DIR`, database, and keys, and declare
which one it is with `POLPO_PROJECT_ENVIRONMENT=development|production` (or
`environment` in `PolpoServer`). Set it before pointing CLI `0.17.3` or later at the server: the
CLI always calls `/environments/<name>/...`, and an unbound server or one bound to the other
environment answers 404. The setting does not create the separate resources for you.

## Old Live/Test Projects

Projects not yet moved to environments still use `sk_live_`/`sk_test_` keys. CLI `0.17.3` and
later reports them as `legacy` and `polpo deploy` and `polpo link` reject them; a `mixed` key works
only with `--prod` on a project already bound to Production. Do not rename Live to Production or
move Test data to Development yourself: a Test key used a shared agent runtime with separate Test
data, so there is no exact equivalent. The Cloud migration handles that; until then, use an older
CLI or ask for the project to be migrated.
