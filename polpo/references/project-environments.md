# Project environments

Status: published in OSS `0.17.3`. The companion Cloud provisioning, routing and
dashboard implementation is deployed behind the `projects-environments-mode`
rollout. Verify the installed CLI and the selected project's rollout state: the
first managed canary is migrated, while the global project migration has not run.

Exactly two environments belong to one project: Development and Production.
Each has its own process, database capacity, files, sandbox, configuration,
credentials and runtime state. Organization, membership and billing remain common.

The new CLI defaults to Development on every invocation:

```bash
polpo deploy
polpo deploy --prod
polpo deploy --env development
polpo deploy --env production
polpo link --project-id <id> --prod
polpo connections list --prod
polpo data list --prod
```

`--prod` conflicts with `--env development`. Do not infer the target from Git,
NODE_ENV, the dashboard, or the previous command. A missing Development target or
credential is an error, never a reason to retry against Production. Organization
OAuth app administration is unscoped and rejects environment flags.

With the matching Cloud release, browser login records the approving
administrator and checks current membership. Headless `polpo login --api-key`
validates ordinary environment keys through `/v1/credentials/current`; it does
not need organization administration. Do not replace a correctly scoped key
with a broader one just because old `/v1/orgs` discovery rejects it. A Production
key still requires `--prod`; login never stores a Production default. Link reuses
an existing environment credential without minting another key or writing that
credential into `.env.local`. An administrator login can create the project key.

Use one `.polpo` source tree and deploy its definitions independently. Deploy does
not discover/upload model keys, vault credentials or accumulated memory. Configure
these explicitly in the intended environment. Existing `--include-tasks`,
`--include-sessions` and `--all` explicitly import task/session state; `--all`
does not include secrets or memory. Linking pulls definitions, not learned memory.

The normal Polpo key authorizes the target including agents, Data, files,
Connections and Channels; Data does not get its own public key or independent
environment selector. API/SDK calls without a selector follow the verified
key/endpoint, rather than the CLI default. The remote MCP endpoint defaults to
Development for environment projects; bind Production explicitly with
`/environments/production/v1/mcp`.
Legacy Test keys mixed a shared agent runtime with Data Test. Do not relabel them
or move their data automatically; the managed migration must resolve that ambiguity.
