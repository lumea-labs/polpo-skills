# Tasks & Missions

## Tasks

A task is a unit of work assigned to a specific agent.

### Task Status Lifecycle

```
draft → pending → awaiting_approval → assigned → in_progress → review → done
                                                               ↘ failed
```

### Task Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique task ID |
| `title` | string | Human-readable title |
| `description` | string | What to do |
| `assignTo` | string | Agent name |
| `dependsOn` | string[] | Task IDs that must complete first |
| `status` | TaskStatus | Current lifecycle state |
| `group` | string | Logical grouping |
| `missionId` | string | Parent mission (if part of one) |
| `priority` | number | Priority level |
| `deadline` | string | ISO deadline |
| `maxRetries` | number | Max retry attempts |
| `sideEffects` | boolean | If true, blocks auto-retry (requires approval) |
| `expectations` | TaskExpectation[] | Validation criteria |
| `expectedOutcomes` | ExpectedOutcome[] | Expected deliverables |

### Task Expectations (Validation)

| Type | Description |
|------|-------------|
| `test` | Run a test command, pass if exit 0 |
| `file_exists` | Check specific files exist |
| `script` | Run a validation script |
| `llm_review` | LLM evaluates the output against criteria |

### Task Phases

1. **execution** — agent works on the task
2. **review** — assessment runs (expectations checked)
3. **fix** — if review fails, orchestrator sends fix instructions
4. **clarification** — Q&A between orchestrator and agent

### Retry Policy

```json
{
  "maxRetries": 3,
  "retryPolicy": {
    "escalateAfter": 2,
    "fallbackAgent": "senior-coder",
    "escalateModel": "anthropic/claude-sonnet-4"
  }
}
```

## Missions

A mission is a multi-task workflow with coordination, scheduling, and quality gates.

### Mission Status Lifecycle

```
draft → scheduled → active → completed
       → recurring   ↘ paused → active
                      ↘ failed
                      ↘ cancelled
```

### Mission Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique mission ID |
| `name` | string | Mission name |
| `data` | string | JSON mission content (tasks, config) |
| `status` | MissionStatus | Current state |
| `schedule` | string | Cron expression (for recurring) |
| `endDate` | string | Stop recurring after this date |
| `deadline` | string | Hard deadline for completion |
| `qualityThreshold` | number | Min score (1-5) to pass |
| `prompt` | string | Original user request |
| `notifications` | ScopedNotificationRules | Alert config |

### Mission Report

Generated on completion:

```typescript
{
  missionId: string,
  allPassed: boolean,
  totalDuration: number,
  avgScore?: number,
  tasks: [{
    taskId: string,
    status: string,
    duration: number,
    score?: number,
    filesCreated: string[],
    filesEdited: string[],
    outcomes: TaskOutcome[],
  }],
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/tasks` | List tasks |
| POST | `/v1/tasks` | Create task |
| GET | `/v1/tasks/{id}` | Get task |
| PATCH | `/v1/tasks/{id}` | Update task |
| DELETE | `/v1/tasks/{id}` | Delete task |
| POST | `/v1/tasks/{id}/run` | Execute task |
| POST | `/v1/tasks/{id}/pause` | Pause task |
| GET | `/v1/missions` | List missions |
| POST | `/v1/missions` | Create mission |
| POST | `/v1/missions/{id}/execute` | Run mission |

Source: `packages/core/src/types.ts`, `packages/server/src/routes/tasks.ts`, `packages/server/src/routes/missions.ts`
