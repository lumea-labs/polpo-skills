# Tasks & Missions

## Concepts

A **task** is a discrete unit of work owned by a single agent. It has a lifecycle, expectations (success criteria), and produces outcomes (declared artifacts). Tasks are persisted; you can re-deploy them, retry failed ones, and inspect their transcript.

A **mission** is a multi-task workflow. Missions wrap a structured plan (the `data` field, a JSON document) defining task ordering, dependencies, human approval checkpoints, timed delays, and quality gates. Use missions when you need parallelism, scheduling, or human-in-the-loop.

**When to pick which:**
- Single agent, single deliverable → **task**.
- Multiple agents, dependencies, parallel work, checkpoints, or recurring schedule → **mission**.

## Task lifecycle

The state machine (canonical):

```
draft → pending → assigned → in_progress → review → done
  ↓                ↑              ↓          ↓         ↑
  └──awaiting_approval ←──────────┴──────────┴─────────┘
                     ↓
                   failed → pending
```

Valid transitions:

| From | Allowed → |
|---|---|
| `draft` | `pending` |
| `pending` | `assigned`, `awaiting_approval` |
| `assigned` | `in_progress`, `awaiting_approval` |
| `in_progress` | `review`, `failed`, `awaiting_approval` |
| `review` | `done`, `failed`, `awaiting_approval` |
| `awaiting_approval` | `assigned`, `failed`, `done`, `pending` |
| `failed` | `pending` (retry) |
| `done` | — (terminal) |

**Who drives transitions:**
- Orchestrator/runner: most of them (assign → in_progress → review → done|failed)
- Clients via `PATCH /v1/tasks/{id}`: typically `failed → pending` (retry), `awaiting_approval → done|failed` (approval decisions), `draft → pending` (via `POST /v1/tasks/{id}/queue`)

## Mission lifecycle

```
draft → active → paused → completed | failed | cancelled
  ↓       ↑
  └─scheduled ← recurring (loops until endDate)
```

- `draft`: created but not executing
- `scheduled` / `recurring`: has a cron expression or one-shot ISO timestamp
- `active`: tasks are running
- `paused`: explicitly paused; can resume
- `completed` / `failed` / `cancelled`: terminal

## Task shape — full field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | UUID/nanoid. Server-generated. |
| `title` | string | yes | Visible in logs + dashboard. |
| `description` | string | yes | Sent to the agent as the task prompt. |
| `assignTo` | string | yes | Must match an agent name in agents.json. |
| `status` | TaskStatus | yes | One of 8 statuses (see lifecycle). |
| `expectations` | TaskExpectation[] | no | Success criteria. Default `[]`. |
| `expectedOutcomes` | ExpectedOutcome[] | no | Declared artifacts the task should produce. |
| `dependsOn` | string[] | no | IDs of tasks that must complete first. |
| `missionId` | string | no | Parent mission ID (set by orchestrator if spawned from a mission). |
| `group` | string | no | Logical grouping for filtering. |
| `retries` | number | server-managed | Auto-incremented on failure. |
| `maxRetries` | number | no | Cap before final failure. Default from settings. |
| `maxDuration` | number | no | Timeout in ms. 0 = no timeout. |
| `retryPolicy` | RetryPolicy | no | `{escalateAfter?, fallbackAgent?, escalateModel?}` |
| `sideEffects` | boolean | no | Blocks auto-retry; routes through `awaiting_approval`. |
| `deadline` | string (ISO) | no | Absolute deadline — SLA monitor will emit `sla:violated` if missed. |
| `priority` | number | no | Quality weight in scoring. Default 1.0. |
| `notifications` | ScopedNotificationRules | no | Task-scoped overrides. |
| `user` | string | no | Opaque end-user id (OpenAI-compat) for SaaS multi-tenant billing. |
| `draft` | boolean | request-only | If true, task lands in `draft` status (not picked up by orchestrator). |
| `phase`, `fixAttempts`, `questionRounds`, `sessionId`, `outcomes`, `revisionCount` | various | server-managed | Runtime fields. Read-only for clients. |
| `createdAt`, `updatedAt` | ISO strings | server-managed | — |

## Expectation types

Expectations validate task success. Discriminated by `type`. **Critical**: `file_exists` requires `paths: string[]` (plural array), NOT `path: string` (singular — silently dropped).

### file_exists
```json
{ "type": "file_exists", "paths": [".polpo/output/report.pdf"] }
```

### test
```json
{ "type": "test", "command": "npm test" }
```
Exit code 0 = pass.

### script
```json
{ "type": "script", "command": "python scripts/check.py" }
```
Like `test` but conceptually for custom validators.

### llm_review
```json
{
  "type": "llm_review",
  "criteria": "Output should be a clear executive summary",
  "dimensions": [
    { "name": "clarity", "description": "Easy to follow?", "weight": 0.5 },
    { "name": "accuracy", "description": "Facts cited?", "weight": 0.5 }
  ],
  "threshold": 3.5
}
```
At least one of `criteria` or `dimensions` is required. Threshold default 3.0 (scale 1-5).

## Creating a task — examples

### Minimal
```json
{
  "title": "Summarize Q1",
  "description": "Write a 5-bullet summary",
  "assignTo": "analyst"
}
```

### Draft (won't be picked up)
```json
{ "title": "...", "description": "...", "assignTo": "...", "draft": true }
```
Move to pending later with `POST /v1/tasks/{id}/queue`.

### With file_exists expectation
```json
{
  "title": "Build PDF",
  "description": "Produce .polpo/output/summary.pdf",
  "assignTo": "analyst",
  "expectations": [
    { "type": "file_exists", "paths": [".polpo/output/summary.pdf"] }
  ]
}
```

### With retry policy + deadline
```json
{
  "title": "Deploy",
  "description": "Push to prod",
  "assignTo": "devops",
  "maxDuration": 3600000,
  "deadline": "2026-06-01T00:00:00Z",
  "retryPolicy": {
    "escalateAfter": 2,
    "fallbackAgent": "devops-lead",
    "escalateModel": "anthropic/claude-opus-4-7"
  }
}
```

### Multi-tenant `user` field (SaaS billing)
```json
{
  "title": "Generate invoice",
  "description": "...",
  "assignTo": "billing",
  "user": "customer-id-12345"
}
```
The user id is persisted on the task and inherited by any spawned runs.

## Task control endpoints

Beyond `PATCH /v1/tasks/{id}` for status transitions:

| Endpoint | Effect |
|---|---|
| `POST /v1/tasks/{id}/retry` | `failed → pending`, increments `retries`. Bypasses `maxRetries`. |
| `POST /v1/tasks/{id}/kill` | Force `failed`. Body `{reason?}`. Stops a stuck running task. |
| `POST /v1/tasks/{id}/reassess` | Re-runs expectations against last output (no new agent run). |
| `POST /v1/tasks/{id}/queue` | `draft → pending`. Manual trigger for a draft task. |
| `POST /v1/tasks/{id}/force-fail` | Immediate `failed` with reason. SLA-violation analog. |

## Mission shape — full field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | server | UUID/nanoid |
| `name` | string | yes | **UNIQUE** — re-using a name on POST returns 409/500. |
| `data` | string | yes | JSON-stringified mission document. See below. |
| `prompt` | string | no | Original user prompt (for audit/context). |
| `status` | MissionStatus | yes | `draft` / `scheduled` / `recurring` / `active` / `paused` / `completed` / `failed` / `cancelled` |
| `deadline` | ISO string | no | Whole-mission deadline. |
| `schedule` | string | no | Cron expression OR ISO timestamp. |
| `endDate` | ISO string | no | End date for recurring missions. |
| `qualityThreshold` | number | no | Min average task score (1-5). |
| `notifications` | ScopedNotificationRules | no | Inherited by all tasks unless overridden. |
| `executionCount` | number | server | Incremented each run (useful for recurring). |
| `user` | string | no | Opaque end-user id, propagates to spawned tasks. |
| `createdAt`, `updatedAt` | ISO strings | server | — |

## Mission document schema (the `data` field)

`Mission.data` is a JSON string. When parsed, it's:

```typescript
{
  tasks: MissionTask[],          // ≥ 1 required, titles unique
  team?: AgentConfig[],          // inline team merged with project teams
  checkpoints?: MissionCheckpoint[],
  delays?: MissionDelay[],
  qualityGates?: MissionQualityGate[],
  notifications?: ScopedNotificationRules
}
```

### MissionTask (inside the document)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | Unique within the mission. |
| `description` | string | yes | Sent to the agent. |
| `assignTo` | string | no | Agent name. If omitted, orchestrator picks default. |
| `dependsOn` | string[] | no | Task titles (NOT ids) that must finish first. |
| `expectations` | TaskExpectation[] | no | Same shapes as above (`file_exists` uses `paths` plural). |
| `expectedOutcomes` | ExpectedOutcome[] | no | Declared artifacts. |
| `maxDuration` | number | no | Timeout in ms. |
| `retryPolicy` | RetryPolicy | no | — |
| `sideEffects` | boolean | no | Blocks auto-retry. |
| `notifications` | ScopedNotificationRules | no | Task-scoped overrides. |

### MissionCheckpoint, MissionDelay, MissionQualityGate

All three are flow-control gates with the same shape:
```typescript
{
  name: string,
  afterTasks: string[],   // task titles that must finish before the gate triggers
  blocksTasks: string[],  // task titles blocked until the gate releases
  // ... plus type-specific fields:
  // - checkpoint: message?, notifyChannels?
  // - delay: duration (ISO 8601, e.g. "PT2H", "P1D"), message?, notifyChannels?
  // - qualityGate: minScore?, requireAllPassed?, condition?, notifyChannels?
}
```

**Critical validator rule**: for each gate, every task in `blocksTasks` MUST have a `dependsOn` array that includes ALL entries in `afterTasks`. Otherwise the schema rejects the mission. Without that dependency the blocked task would start in parallel, ignoring the gate.

Valid:
```json
{
  "tasks": [
    {"title":"A","dependsOn":[]},
    {"title":"B","dependsOn":[]},
    {"title":"C","dependsOn":["A","B"]}
  ],
  "checkpoints": [
    {"name":"gate","afterTasks":["A","B"],"blocksTasks":["C"]}
  ]
}
```

Invalid — C missing B in dependsOn:
```json
{
  "tasks": [
    {"title":"C","dependsOn":["A"]}   // missing "B"
  ],
  "checkpoints": [
    {"name":"gate","afterTasks":["A","B"],"blocksTasks":["C"]}
  ]
}
```

## Creating a mission — examples

`data` MUST be a JSON string (not an object) when calling the API directly. The CLI auto-stringifies if you pass an object in `.polpo/missions/*.json`.

### Single task
```json
{
  "name": "Q1 review",
  "status": "draft",
  "data": "{\"tasks\":[{\"title\":\"summary\",\"description\":\"Write Q1 summary\",\"assignTo\":\"analyst\"}]}"
}
```

### Linear A → B → C
```json
{
  "name": "weekly-report",
  "data": "{\"tasks\":[{\"title\":\"A\",\"description\":\"gather data\",\"assignTo\":\"analyst\"},{\"title\":\"B\",\"description\":\"analyze\",\"assignTo\":\"analyst\",\"dependsOn\":[\"A\"]},{\"title\":\"C\",\"description\":\"publish\",\"assignTo\":\"analyst\",\"dependsOn\":[\"B\"]}]}"
}
```

### Parallel fan-out (A → {B, C} → D)
```json
{
  "name": "parallel-build",
  "data": "{\"tasks\":[{\"title\":\"A\",\"description\":\"setup\",\"assignTo\":\"a1\"},{\"title\":\"B\",\"description\":\"branch1\",\"assignTo\":\"a2\",\"dependsOn\":[\"A\"]},{\"title\":\"C\",\"description\":\"branch2\",\"assignTo\":\"a3\",\"dependsOn\":[\"A\"]},{\"title\":\"D\",\"description\":\"merge\",\"assignTo\":\"a4\",\"dependsOn\":[\"B\",\"C\"]}]}"
}
```
B and C run in **parallel** because both depend on A only.

### Mission with a human-approval checkpoint
```json
{
  "name": "draft-and-publish",
  "data": "{\"tasks\":[{\"title\":\"draft\",\"description\":\"Write draft\",\"assignTo\":\"writer\"},{\"title\":\"publish\",\"description\":\"Publish\",\"assignTo\":\"editor\",\"dependsOn\":[\"draft\"]}],\"checkpoints\":[{\"name\":\"review\",\"afterTasks\":[\"draft\"],\"blocksTasks\":[\"publish\"],\"message\":\"Draft ready for review\"}]}"
}
```
Mission pauses after `draft` completes. Resume via `POST /v1/missions/{id}/checkpoints/review/resume`.

### Mission with a quality gate
```json
{
  "name": "quality-controlled",
  "data": "{\"tasks\":[{\"title\":\"content\",\"description\":\"Write content\",\"assignTo\":\"writer\",\"expectations\":[{\"type\":\"llm_review\",\"criteria\":\"clear and accurate\",\"threshold\":4.0}]},{\"title\":\"archive\",\"description\":\"Archive\",\"assignTo\":\"archivist\",\"dependsOn\":[\"content\"]}],\"qualityGates\":[{\"name\":\"q1\",\"afterTasks\":[\"content\"],\"blocksTasks\":[\"archive\"],\"minScore\":4.0}]}"
}
```

### Scheduled (cron) mission
```json
{
  "name": "daily-digest",
  "status": "recurring",
  "schedule": "0 9 * * *",
  "data": "{\"tasks\":[{\"title\":\"build\",\"description\":\"Daily digest\",\"assignTo\":\"analyst\"}]}"
}
```

## Atomic mission edits

After creation, edit mission components without re-uploading the full document. Used heavily by the dashboard. See `api-endpoints.md` for the full list. Examples:

```bash
# Add a task to an existing mission
curl -X POST https://my-project.polpo.cloud/v1/missions/{missionId}/tasks \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -d '{"title":"new-task","description":"...","assignTo":"analyst","dependsOn":["existing-task"]}'

# Add a checkpoint
curl -X POST https://my-project.polpo.cloud/v1/missions/{missionId}/checkpoints \
  -d '{"name":"review","afterTasks":["draft"],"blocksTasks":["publish"]}'
```

## Common pitfalls

- **`file_exists` with `path` singular** → silently dropped. Always use `paths: [".../file"]` plural.
- **Trying to PATCH a task outside `VALID_TRANSITIONS`** → returns `Invalid transition` error. The state machine is strict.
- **Adding a task to a mission with missing `dependsOn`** → schema rejects on insertion if a checkpoint's `blocksTasks` requires it.
- **Mission name collision** → mission `name` is UNIQUE in the DB. Re-deploying a mission with the same name returns a constraint violation. Use `PATCH /v1/missions/{id}` to update, not re-POST.
- **Confusing task draft vs mission draft** — task `draft: true` means "exists but not picked up by orchestrator until queued"; mission `status: "draft"` means "the entire workflow is paused until promoted to active or scheduled".
- **Mission `data` as object instead of string** — when calling the API directly, `data` MUST be a JSON-stringified document. The CLI's `polpo deploy` auto-stringifies if you write an object in `.polpo/missions/*.json`, but raw API consumers must do it themselves.
