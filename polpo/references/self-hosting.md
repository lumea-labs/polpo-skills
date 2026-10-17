# Self-Hosting The OSS Runtime

The open-source runtime lives in `lumea-labs/polpo`. It serves one project directory
(`WORK_DIR`, default `/app/workspace`) whose `.polpo/` folder holds the agents, Loops, skills,
and tools.

## Docker Compose (recommended)

The repository ships a production-oriented stack: PostgreSQL, the runtime, and a single-tenant
dashboard that holds the runtime key on the server.

```bash
git clone https://github.com/lumea-labs/polpo && cd polpo
cp docker/self-host/.env.example docker/self-host/.env
# Edit .env: set POSTGRES_PASSWORD, POLPO_API_KEY, POLPO_MODEL, and AI_GATEWAY_API_KEY
docker compose --env-file docker/self-host/.env \
  -f docker/self-host/compose.example.yml up --build --detach --wait
```

The dashboard is at `http://localhost:3000`. The runtime itself is only reachable on the private
Compose network, and the dashboard proxies requests to it. Keep it that way: the runtime's setup
endpoints were designed for a local wizard, so do not publish port 3890 to an untrusted network.

## Environment

The Compose example passes only `DATABASE_URL`, `POLPO_API_KEY`, `POLPO_MODEL`, and
`AI_GATEWAY_API_KEY` to the runtime. To use any other variable below, add it to the `runtime`
service's `environment:` block as well as to `.env`.

| Variable | Purpose |
|---|---|
| `POLPO_API_KEY` / `POLPO_API_KEYS` | Bearer key(s) for the REST API, completions, and runs. **If both are unset, the API has no authentication.** Even with a key, the setup routes `/api/v1/health`, `/api/v1/config`, `/api/v1/filesystem`, and `/api/v1/providers` stay unauthenticated, so never expose port 3890 directly. |
| `DATABASE_URL` | PostgreSQL for runtime state when `.polpo/project.json` has `settings.storage: "postgres"`. |
| `POLPO_MODEL` | Default model ID, for example `openai/gpt-5`. |
| `AI_GATEWAY_API_KEY` (or a provider key) | Model access. Change it together with `POLPO_MODEL`. |
| `PORT`, `HOST`, `WORK_DIR`, `CORS_ORIGINS` | Server binding, project directory, and allowed browser origins. |
| `POLPO_PROJECT_ENVIRONMENT` | `development` or `production`: labels this process. Run a separate server, work directory, database, and keys per environment. |
| `POLPO_DATA_DATABASE_URL` | Separate PostgreSQL for application databases (owner needs `CREATEROLE`). Without it, Data is off. |
| `POLPO_DATA_AGENT_GRANTS` | JSON map of agent to database grants (see `polpo-agents`). |

Minimal `.polpo/project.json`:

```json
{ "schemaVersion": 2, "project": "my-app", "settings": { "storage": "postgres" } }
```

## Calling A Self-Hosted Runtime

- REST API: `http://<host>:3890/api/v1/...`, for example `/api/v1/health`.
- Chat completions and durable runs exist only under `/v1`: `/v1/chat/completions`,
  `/v1/runs/{runId}/events`.
- The SDK picks the prefix itself: `/v1` for `*.polpo.sh` and `*.polpo.cloud`, `/api/v1` for
  any other host. Pass the bare origin as `baseUrl`; set `apiPrefix` only for a custom proxy.

## What Is Different From Cloud

- **Deploying resources.** `polpo deploy` and the other project commands of the CLI call the
  Cloud API. On a self-hosted runtime, edit `.polpo/` inside `WORK_DIR` (mounted volume or
  image layer) and restart or use the REST API.
- **Connections and Channels** exist in the OSS packages but are not wired by the default
  server. Embed the runtime with `new PolpoServer(...)` or `createApp(...)` from
  `@polpo-ai/node` and pass `connectService` or `channels` (and, with `createApp` only, `data`;
  `PolpoServer` enables Data from `POLPO_DATA_DATABASE_URL`). See `polpo-integrations` and
  `polpo-channels`.
- **Schedules** (`.polpo/schedules`) need a schedule service and driver that the stock server
  does not wire; only legacy mission schedules work out of the box.
- **Runtime hooks** run for agents that list them, but only `command` and `http` (without a
  Connection) handlers work unless you embed the server and pass a `runtimeHookHost`.
- **Steering receipts** are kept in memory by one process; several replicas need a shared,
  durable steering store.
- **Sandboxes.** Cloud runs tools in managed sandboxes with volumes. A self-hosted runtime runs
  tools in its own process or container; isolate the container instead.
- **Not available:** organizations, billing, managed OAuth apps, the remote MCP server, the
  Builder agent, and `polpo_*` MCP tools.

## Checking An Install

```bash
curl -H "Authorization: Bearer $POLPO_API_KEY" http://localhost:3890/api/v1/health
curl -H "Authorization: Bearer $POLPO_API_KEY" -H "Content-Type: application/json" \
  http://localhost:3890/v1/chat/completions \
  -d '{"agent":"support","messages":[{"role":"user","content":"ping"}]}'
```

Repeat the second request without the header. It should fail with 401. If it succeeds, the
server is running without a key.
