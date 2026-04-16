# API Endpoints

All routes prefixed with `/v1/`. Response format: `{ ok: boolean, data?: any, error?: string }`.
Auth: `Authorization: Bearer sk_live_...` or session cookie.

## Agents & Teams
| Method | Path | Description |
|--------|------|-------------|
| GET | `/agents` | List all agents |
| POST | `/agents` | Create agent |
| GET | `/agents/{name}` | Get agent |
| PATCH | `/agents/{name}` | Update agent |
| DELETE | `/agents/{name}` | Delete agent |
| GET | `/teams` | List teams |
| POST | `/teams` | Create team |
| PATCH | `/teams/{name}` | Update team |
| DELETE | `/teams/{name}` | Delete team |

## Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create task |
| GET | `/tasks/{id}` | Get task |
| PATCH | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |
| POST | `/tasks/{id}/run` | Execute task |
| POST | `/tasks/{id}/pause` | Pause task |

## Missions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/missions` | List missions |
| POST | `/missions` | Create mission |
| GET | `/missions/{id}` | Get mission |
| PATCH | `/missions/{id}` | Update mission |
| POST | `/missions/{id}/execute` | Run mission |

## Chat / Completions
| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat/completions` | OpenAI-compatible chat completions |
| GET | `/chat/sessions` | List chat sessions |
| GET | `/chat/sessions/{id}/messages` | Get session messages |
| POST | `/chat/sessions/{id}/message` | Send message |
| DELETE | `/chat/sessions/{id}` | Delete session |

## Vault
| Method | Path | Description |
|--------|------|-------------|
| POST | `/agents/{name}/vault/{service}` | Store credentials |
| GET | `/agents/{name}/vault` | List entries (masked) |
| DELETE | `/agents/{name}/vault/{service}` | Remove entry |

## Memory
| Method | Path | Description |
|--------|------|-------------|
| GET | `/memory` | Read project memory |
| PUT | `/memory` | Write project memory |
| GET | `/memory/agent/{name}` | Read agent memory |
| PUT | `/memory/agent/{name}` | Write agent memory |

## Files
| Method | Path | Description |
|--------|------|-------------|
| GET | `/files/read?path=...` | Read file |
| POST | `/files/write` | Write file |
| GET | `/files/list?path=...` | List directory |
| DELETE | `/files/{path}` | Delete file |

## Skills
| Method | Path | Description |
|--------|------|-------------|
| GET | `/skills` | List installed skills |
| POST | `/skills/{name}/assign` | Assign skill to agent |
| DELETE | `/skills/{name}/unassign` | Unassign skill |

## Config & State
| Method | Path | Description |
|--------|------|-------------|
| GET | `/config` | Read polpo.json |
| PATCH | `/config` | Update config |
| GET | `/state` | Runtime state snapshot |

## Events
| Method | Path | Description |
|--------|------|-------------|
| GET | `/events/stream` | SSE stream (task status, messages) |

## Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET/POST | `/approvals` | Approval gate workflow |
| GET/POST | `/schedules` | Cron scheduling |
| GET/POST | `/playbooks` | Reusable task templates |
| GET/POST | `/watchers` | Task status watchers |

Source: `packages/server/src/routes/`
