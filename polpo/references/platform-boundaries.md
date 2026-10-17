# OSS And Cloud Boundaries

Use this when a user asks "can I do X self-hosted?", when something works in Cloud but not
locally, or when deciding where new behaviour belongs.

## Feature Availability

| Feature | Self-hosted OSS | Polpo Cloud |
|---|---|---|
| Agents, teams, instructions, model profiles | Yes (`.polpo/` files) | Yes (`polpo deploy`, dashboard) |
| Chat completions, Sessions, durable runs, steering | Yes | Yes |
| Project Loops, tasks, missions, playbooks | Yes | Yes |
| Runtime skills (`skill_list`/`skill_read`) | Yes | Yes |
| Runtime hooks (`.polpo/hooks`) | Yes; stock server runs `command` and `http` handlers only | Depends on the project's rollout |
| Steering with receipts (`polpo runs steer`) | Yes, single process | Yes |
| Development and Production environments | One server per environment (`POLPO_PROJECT_ENVIRONMENT`) | Projects moved to environments; older projects use Live/Test keys |
| Custom tools (`defineTool`) | Yes, in the runtime process | Yes, in managed sandboxes |
| Schedules (`.polpo/schedules`, cron/once) | Not enabled by the stock server (returns 503); a host must wire a schedule service and driver. Legacy mission schedules work. | Yes, delivered by QStash |
| Typed Memory | Yes | Yes, plus automatic learning |
| Knowledge (`brain`) | Optional | Yes |
| Application databases | Yes, with `POLPO_DATA_DATABASE_URL`; grants from `POLPO_DATA_AGENT_GRANTS` | Yes, on Neon, per environment; grants in dashboard |
| MCP servers on an agent (`mcpServers`: stdio, HTTP, SSE) | Yes | Through Connections |
| Connections and OAuth | Embed `@polpo-ai/connect*` and pass `connectService`; register your own OAuth apps | Yes, with managed OAuth apps |
| Channels (WhatsApp, Telegram, Slack, Discord) | Embed `@polpo-ai/channels` and pass `channels` | Yes, managed webhooks |
| Sandboxed execution and volumes | Bring your own container isolation | Yes |
| Vault | `.polpo/vault.enc` + `POLPO_VAULT_KEY` | Yes |
| Organizations, API keys, billing, BYOK | No (static `POLPO_API_KEY`) | Yes |
| Remote MCP server (`polpo_*` tools), Builder agent | No | Yes |
| `polpo` CLI project commands | No (they call the Cloud API) | Yes |

## Packages

Everything under `@polpo-ai/*` is open source and versioned together: `core` (types and store
interfaces), `node` (the runtime server), `server` (HTTP routes), `drizzle` (Postgres/SQLite
stores), `tools`, `llm`, `channels`, `connect`, `connect-server`, `connectors`, `sdk`, `react`,
`cli`. Polpo Cloud consumes the same published packages and adds managed implementations
(multi-tenant databases, sandboxes, object storage, event bus) behind the same interfaces.

The UI packages `@polpo-ai/chat`, `@polpo-ai/ui`, and `create-polpo-app` are released separately
from the runtime.

## Where New Behaviour Belongs

When the user maintains Polpo itself: if a self-hosted runtime could reasonably need the
behaviour, define it in OSS first. Cloud then adds a managed adapter, storage, UI, entitlement,
or rollout around it. Keep runtime semantics out of Cloud route handlers and dashboard-only
settings. Feature flags decide availability, not what a public contract means.
