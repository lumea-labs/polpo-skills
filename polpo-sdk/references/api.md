# Polpo API Endpoints

Base URL: `https://api.polpo.sh` (cloud) or `http://localhost:3890` (local dev)

Auth: `Authorization: Bearer <your-api-key>`

## Completions
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/chat/completions` | Chat completion (streaming or non-streaming). Set `agent` for agent-direct mode. |

## Agents
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/agents` | List all agents |
| POST | `/v1/agents?team={name}` | Create agent |
| PATCH | `/v1/agents/{name}` | Update agent |
| DELETE | `/v1/agents/{name}` | Delete agent |

## Sessions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/chat/sessions` | List chat sessions |
| GET | `/v1/chat/sessions/{id}/messages` | Get session messages |
| PATCH | `/v1/chat/sessions/{id}` | Rename session |
| DELETE | `/v1/chat/sessions/{id}` | Delete session |

## Memory
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/memory` | Get project memory |
| PUT | `/v1/memory` | Save project memory |
| GET | `/v1/memory/agent/{name}` | Get agent memory |
| PUT | `/v1/memory/agent/{name}` | Save agent memory |

## Vault
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/vault/entries/{agent}` | List vault entries for agent |
| POST | `/v1/vault/entries` | Save vault entry |
| DELETE | `/v1/vault/entries/{agent}/{service}` | Delete vault entry |

## Webhooks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/webhooks` | List webhooks |
| POST | `/v1/webhooks` | Register webhook |
| DELETE | `/v1/webhooks/{id}` | Delete webhook |

## Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/tasks` | List tasks |
| POST | `/v1/tasks` | Create task |
| DELETE | `/v1/tasks/{id}` | Delete task |
| POST | `/v1/tasks/{id}/kill` | Kill task |
| POST | `/v1/tasks/{id}/execute` | Execute task in sandbox (SSE) |

## Missions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/missions` | List missions |
| POST | `/v1/missions` | Create mission |
| POST | `/v1/missions/{id}/execute` | Execute mission |
| DELETE | `/v1/missions/{id}` | Delete mission |

## Events (SSE)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/events?filter={pattern}` | SSE event stream. Patterns: `*`, `task:*`, `agent:*` |

## Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
