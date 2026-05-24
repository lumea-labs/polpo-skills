# API Endpoints

Complete reference for the Polpo HTTP API.

## Conventions

**Base URL:** `https://{project-slug}.polpo.cloud`

**Auth:** `Authorization: Bearer sk_live_...` (project-scoped API key)

**Response envelope:** every JSON response follows
```json
{ "ok": true,  "data": ... }     // success
{ "ok": false, "error": "..." }  // failure
```

**Path layout:** every route under `/v1/`. Chat completions are OpenAI-compatible at `/v1/chat/completions`.

**ID conventions:**
- **Agents**: identified by `name` (string), NOT UUID
- **Missions**: identified by `id` (UUID/nanoid)
- **Tasks**: identified by `id` (UUID/nanoid)

Always pass the right one. The most common 404 is passing a mission `name` where `id` is expected.

**Pagination:** not currently implemented. List endpoints return the full result set.

---

## Agents & Teams

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/v1/agents` | — | `Agent[]` |
| POST | `/v1/agents` | `AddAgentSchema` | `{added: true}` |
| GET | `/v1/agents/{name}` | — | `Agent` |
| PATCH | `/v1/agents/{name}` | `UpdateAgentSchema` | `Agent` |
| DELETE | `/v1/agents/{name}` | — | `{removed: true}` |
| POST | `/v1/agents/{name}/avatar` | multipart/form-data, field `file` | `{avatar: path}` |
| DELETE | `/v1/agents/{name}/avatar` | — | `{removed}` |
| GET | `/v1/agents/processes` | — | active agent processes |
| GET | `/v1/agents/processes/{taskId}/activity` | — | task activity history |
| GET | `/v1/agents/teams` | — | `Team[]` |
| GET | `/v1/agents/team?name={name}` | — | single `Team` |
| POST | `/v1/agents/teams` | `AddTeamSchema` | `{added: true}` |
| PATCH | `/v1/agents/team` | `RenameTeamSchema` | `Team` (rename — note path is `/team` singular) |
| DELETE | `/v1/agents/teams/{name}` | — | `{removed: true}` |

### Example: create an agent
```bash
curl -X POST https://my-project.polpo.cloud/v1/agents \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "researcher",
    "role": "Senior research analyst",
    "model": "xai/grok-4.1-fast-non-reasoning",
    "systemPrompt": "You are a meticulous researcher who always cites sources.",
    "allowedTools": ["read", "write", "search_*", "memory_*"]
  }'
```

For the full agent shape see `agent-config.md`.

---

## Tasks

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/v1/tasks` | query: `?status=&group=&assignTo=` | `Task[]` |
| POST | `/v1/tasks` | `CreateTaskSchema` | `Task` |
| GET | `/v1/tasks/{id}` | — | `Task` |
| PATCH | `/v1/tasks/{id}` | `UpdateTaskSchema` | `Task` |
| DELETE | `/v1/tasks/{id}` | — | `{removed: true}` |
| DELETE | `/v1/tasks` | query: `?status=&group=&all=true` | `{deleted: N}` |
| POST | `/v1/tasks/{id}/retry` | — | `{retried: true}` |
| POST | `/v1/tasks/{id}/kill` | `{reason?}` | `{killed: true}` |
| POST | `/v1/tasks/{id}/reassess` | — | `{reassessed: true}` |
| POST | `/v1/tasks/{id}/queue` | — | `{queued: true}` — moves draft → pending |
| POST | `/v1/tasks/{id}/force-fail` | `{reason}` | `{failed: true}` |

### Example: create a draft task with file_exists expectation
```bash
curl -X POST https://my-project.polpo.cloud/v1/tasks \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quarterly summary",
    "description": "Write a one-page summary of Q1 KPIs to .polpo/output/summary.md",
    "assignTo": "analyst",
    "draft": true,
    "expectations": [
      { "type": "file_exists", "paths": [".polpo/output/summary.md"] }
    ]
  }'
```

For full task shape see `tasks-missions.md`.

---

## Missions

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/v1/missions` | — | `Mission[]` |
| POST | `/v1/missions` | `CreateMissionSchema` | `Mission` |
| GET | `/v1/missions/{id}` | — | `Mission` |
| PATCH | `/v1/missions/{id}` | `UpdateMissionSchema` | `Mission` |
| DELETE | `/v1/missions/{id}` | — | `{deleted: true}` |
| POST | `/v1/missions/{id}/execute` | — | spawned mission state |
| POST | `/v1/missions/{id}/resume` | `{retryFailed?: boolean}` | spawned mission state |
| POST | `/v1/missions/{id}/abort` | — | `{aborted: N}` |
| GET | `/v1/missions/resumable` | — | resumable `Mission[]` |
| GET | `/v1/missions/checkpoints` | — | active checkpoints |
| POST | `/v1/missions/{id}/checkpoints/{name}/resume` | — | `{resumed: true}` |
| GET | `/v1/missions/delays` | — | active delays |

### Atomic mission edits (used by the dashboard)

| Method | Path | Body |
|--------|------|------|
| POST | `/v1/missions/{id}/tasks` | `AddMissionTaskSchema` |
| PATCH | `/v1/missions/{id}/tasks/{title}` | `UpdateMissionTaskSchema` |
| DELETE | `/v1/missions/{id}/tasks/{title}` | — |
| PUT | `/v1/missions/{id}/tasks/reorder` | `ReorderMissionTasksSchema` |
| POST | `/v1/missions/{id}/checkpoints` | `AddMissionCheckpointSchema` |
| PATCH | `/v1/missions/{id}/checkpoints/{name}` | `UpdateMissionCheckpointSchema` |
| DELETE | `/v1/missions/{id}/checkpoints/{name}` | — |
| POST | `/v1/missions/{id}/delays` | `AddMissionDelaySchema` |
| PATCH | `/v1/missions/{id}/delays/{name}` | `UpdateMissionDelaySchema` |
| DELETE | `/v1/missions/{id}/delays/{name}` | — |
| POST | `/v1/missions/{id}/quality-gates` | `AddMissionQualityGateSchema` |
| PATCH | `/v1/missions/{id}/quality-gates/{name}` | `UpdateMissionQualityGateSchema` |
| DELETE | `/v1/missions/{id}/quality-gates/{name}` | — |
| POST | `/v1/missions/{id}/team` | `AddMissionTeamMemberSchema` |
| PATCH | `/v1/missions/{id}/team/{name}` | `UpdateMissionTeamMemberSchema` |
| DELETE | `/v1/missions/{id}/team/{name}` | — |
| PUT | `/v1/missions/{id}/notifications` | `UpdateMissionNotificationsSchema` |

### Example: create a mission
```bash
curl -X POST https://my-project.polpo.cloud/v1/missions \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 review",
    "status": "draft",
    "prompt": "Quarterly KPI review for leadership",
    "data": "{\"tasks\":[{\"title\":\"create_brief\",\"description\":\"Write Q1 brief\",\"assignTo\":\"analyst\"},{\"title\":\"build_pdf\",\"description\":\"Produce executive summary PDF\",\"assignTo\":\"analyst\",\"dependsOn\":[\"create_brief\"]}]}"
  }'
```

`data` must be a **JSON-stringified** mission document. See `tasks-missions.md`.

### Example: add a task to an existing mission
```bash
curl -X POST https://my-project.polpo.cloud/v1/missions/{missionId}/tasks \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "research_benchmarks",
    "description": "Pull 5 industry benchmarks via search_web",
    "assignTo": "analyst",
    "dependsOn": ["create_brief"],
    "expectations": [
      { "type": "file_exists", "paths": [".polpo/output/benchmarks.md"] }
    ]
  }'
```

**Note:** the path requires `{missionId}` — the UUID returned when you created the mission. Passing the mission `name` here returns 404.

---

## Chat — sessions & completions

### Sessions
| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/v1/chat/sessions` | query: `?user=&metadata.{key}=` | `{sessions: []}` |
| GET | `/v1/chat/sessions/{id}/messages` | — | `{session, messages}` |
| PATCH | `/v1/chat/sessions/{id}` | `{title: string}` | `{renamed: true}` |
| DELETE | `/v1/chat/sessions/{id}` | — | `{deleted: true}` |
| POST | `/v1/chat/sessions/import` | `{title?, agent?, messages[]}` | `{sessionId, imported}` |

### Completions (OpenAI-compatible)
```
POST /v1/chat/completions
```
Headers:
- `Authorization: Bearer $POLPO_API_KEY`
- `Content-Type: application/json`
- `x-session-id: new` to start a new session, or `x-session-id: <uuid>` to continue

Body:
```json
{
  "agent": "researcher",
  "stream": true,
  "messages": [{"role": "user", "content": "Hello"}],
  "user": "end-user@example.com",
  "metadata": { "tenant": "acme" }
}
```

Streaming returns SSE chunks ending with `data: [DONE]`. Non-streaming returns a standard OpenAI completion JSON.

### Example: streaming chat
```bash
curl https://my-project.polpo.cloud/v1/chat/completions \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "researcher",
    "stream": true,
    "messages": [{"role": "user", "content": "Summarize last quarter."}]
  }'
```

---

## Memory

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/v1/memory` | — | `{exists, content}` (shared) |
| PUT | `/v1/memory` | `{content: string}` | `{saved: true}` |
| GET | `/v1/memory/agent/{agentName}` | — | `{exists, content, agent}` |
| PUT | `/v1/memory/agent/{agentName}` | `{content: string}` | `{saved: true, agent}` |

Pure markdown content, no frontmatter. See `memory.md`.

---

## Vault

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/v1/vault/entries` | `SaveVaultEntryBody` (discriminated by `type`) | `{agent, service, type, keys}` |
| GET | `/v1/vault/entries/{agent}` | — | list of `{service, type, label?, keys}` — **metadata only, no values** |
| PATCH | `/v1/vault/entries/{agent}/{service}` | partial body | `{agent, service, type, keys}` |
| DELETE | `/v1/vault/entries/{agent}/{service}` | — | `{removed: true}` |

See `vault.md` for the full schema of each `type` (`api_key`, `smtp`, `imap`, `oauth`, `login`, `custom`).

### Example: store an OpenAI key for the researcher agent
```bash
curl -X POST https://my-project.polpo.cloud/v1/vault/entries \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "researcher",
    "service": "openai",
    "type": "api_key",
    "credentials": { "key": "sk-..." }
  }'
```

---

## Skills

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/v1/skills` | — | skills + assignments |
| GET | `/v1/skills/{name}/content` | — | full SKILL.md content |
| GET | `/v1/skills/index` | — | tags/categories index |
| PUT | `/v1/skills/{name}/index` | `{tags?, category?}` | updated index entry |
| POST | `/v1/skills/create` | `{name, description, content, allowedTools?}` | `{name, path}` |
| DELETE | `/v1/skills/{name}` | — | `{removed: true, name}` |
| POST | `/v1/skills/{name}/assign` | `{agent}` | `{skill, agent}` |
| POST | `/v1/skills/{name}/unassign` | `{agent}` | `{skill, agent}` |
| POST | `/v1/skills/add` | `{source, skillNames?, force?, assignTo?}` | `{installed, skipped, errors, assigned}` |

Note: `polpo deploy`'s "update existing skill" is implemented as DELETE-then-recreate (no direct PATCH endpoint).

---

## Schedules

| Method | Path | Body |
|--------|------|------|
| GET | `/v1/schedules` | — |
| POST | `/v1/schedules` | `{missionId, expression, recurring?, endDate?}` |
| PATCH | `/v1/schedules/{missionId}` | `{expression?, recurring?, enabled?, endDate?}` |
| DELETE | `/v1/schedules/{missionId}` | — |

---

## Playbooks

| Method | Path | Body |
|--------|------|------|
| GET | `/v1/playbooks` | — |
| GET | `/v1/playbooks/{name}` | — |
| POST | `/v1/playbooks` | `{name, description, mission, parameters?}` |
| POST | `/v1/playbooks/{name}/run` | `{params: {...}}` — returns `{mission, tasks, group, warnings?}` |
| DELETE | `/v1/playbooks/{name}` | — |

---

## Approvals

| Method | Path | Body |
|--------|------|------|
| GET | `/v1/approvals` | query: `?status=&taskId=` |
| GET | `/v1/approvals/{id}` | — |
| POST | `/v1/approvals/{id}/approve` | optional body |
| POST | `/v1/approvals/{id}/reject` | `{feedback, reason?}` |

---

## Events (SSE)

| Method | Path | Query |
|--------|------|-------|
| GET | `/v1/events` | `?filter=task:*,approval:*` |

Server-sent events stream for real-time updates. Supports `Last-Event-ID` for replay. Heartbeat every 30s.

---

## Files

Workspace file I/O (sandboxed to project root).

| Method | Path | Query/Body |
|--------|------|------------|
| GET | `/v1/files/roots` | — |
| GET | `/v1/files/list` | `?path=&recursive=true` |
| GET | `/v1/files/read` | `?path=` |
| POST | `/v1/files/write` | `{path, content}` |
| GET | `/v1/files/exists` | `?path=` |

---

## Config & state

| Method | Path | Body |
|--------|------|------|
| GET | `/v1/config` | — |
| POST | `/v1/config/reload` | — |
| PATCH | `/v1/config/settings` | `UpdateSettingsSchema` |
| PUT | `/v1/config/channels/{name}` | `NotificationChannelConfigSchema` |
| DELETE | `/v1/config/channels/{name}` | — |
| GET | `/v1/state` | — — snapshot of runtime state |

---

## Common pitfalls

**Why am I getting 404 from `POST /v1/missions/{id}/tasks`?**
You're almost certainly passing the mission **name** instead of the mission **id**. Missions are identified by UUID. `GET /v1/missions` returns the list with the `id` field — copy from there.

**Why is my `file_exists` expectation being ignored?**
You wrote `{type: "file_exists", path: "..."}` (singular). The schema requires `paths: string[]` (plural array). Singular `path` is silently dropped by the sanitizer.

**Why does my mission re-deploy crash with `missions_name_key`?**
Mission `name` has a UNIQUE constraint. If you're using `POST /v1/missions` to update an existing mission, use `PATCH /v1/missions/{id}` instead. Or `DELETE` first, then re-POST.

**How do I update an agent?**
`PATCH /v1/agents/{name}` — agents are identified by name, not UUID. Pass only the fields you want to change; the rest are preserved.

**How do I rename a team?**
`PATCH /v1/agents/team` (singular `/team`, not `/teams/{name}`) with body `{oldName, name, description?}`. The path quirk is intentional — `PATCH /v1/agents/teams/{name}` doesn't exist.

**How can I list vault entries without exposing credentials?**
`GET /v1/vault/entries/{agent}` returns metadata only — service name, type, label, and the credential field names — never the values themselves.

---

## Cross-references

- Agent config shape: `agent-config.md`
- Tool catalog + wildcards: `tools.md`
- Task/mission shapes + lifecycle: `tasks-missions.md`
- Vault schemas per `type`: `vault.md`
- Memory file layout: `memory.md`
- Public Mintlify docs: `https://docs.polpo.sh/api-reference/`
