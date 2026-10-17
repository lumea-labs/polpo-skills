# Schedules

A schedule runs an agent, a task, a Channel message, or a webhook at a time. Schedules run in
Polpo Cloud. The stock self-hosted server only has the legacy mission scheduler: creating one of
these schedules there returns 503 `SCHEDULE_SERVICE_UNAVAILABLE` unless the host wires a schedule
service and driver. Store each one as a
JSON file in `.polpo/schedules/`; `polpo deploy` checks every file and the agents and Loops it
names before creating anything.

```json
{
  "id": "nightly-report",
  "name": "Nightly sales report",
  "timing": { "kind": "cron", "expression": "0 7 * * 1-5", "timezone": "Europe/Rome" },
  "invocation": {
    "surface": "agent",
    "agentName": "analyst",
    "input": { "prompt": "Summarise yesterday's sales and post the highlights." },
    "session": { "mode": "new" },
    "execution": { "loop": "daily-report" }
  },
  "policy": { "catchUp": "skip" }
}
```

## Timing

- `{ "kind": "cron", "expression": "...", "timezone": "Area/City" }` repeats.
- `{ "kind": "once", "at": "2026-11-01T09:00:00Z", "timezone": "Area/City" }` runs once.

`policy` can set `catchUp` (`skip` or `latest`), `misfireGraceSeconds`, and `maxConcurrency`.

## Invocation

| `surface` | Main fields |
|---|---|
| `agent` | `agentName`, `input` with `prompt` **or** `messages`, optional `session` (`mode: "new"` or `"reuse"` with `sessionId`, `userId`), optional `execution` (`loop`, `model`, `sandbox`, `guardrails`, `metadata`) |
| `task` | `agentName`, `title`, `prompt`, optional `userId`, `metadata`, `execution` |
| `channel` | A proactive send or an agent reply on a Channel and Route |
| `webhook` | `webhookId`, `payload` |
| `legacy_mission` | `missionId`; only for old projects |

To run a Loop on a schedule, set `invocation.execution.loop`. There is no separate Loop surface.
Never put credentials in the payload.

## API And SDK

| HTTP | SDK |
|---|---|
| `GET /v1/schedules` / `POST /v1/schedules` | `listSchedules()`, `createScheduleV2()` |
| `GET\|PATCH\|DELETE /v1/schedules/{id}` | `getSchedule()`, `updateScheduleV2()`, `deleteScheduleV2()` |
| `POST /v1/schedules/{id}/pause\|resume` | `pauseSchedule()`, `resumeSchedule()` |
| `GET /v1/schedules/{id}/runs` | `listScheduleRuns()` |
| `POST /v1/schedules/{id}/runs` with `{ "idempotencyKey": "..." }` | `triggerSchedule()` |

`createSchedule()`, `updateSchedule()`, and `deleteSchedule()` without the `V2` suffix are the
legacy mission helpers; do not use them for new schedules.

When several writers may edit the same schedule, send the current `revision` as `If-Match` on
update, delete, pause, and resume. In the SDK pass `{ expectedRevision: schedule.revision }` as
the last argument, for example `pauseSchedule(id, { expectedRevision })`. A stale revision returns a conflict; reload and retry. Reusing
a manual-trigger idempotency key returns the same run instead of starting another.

## Checking A Schedule Really Works

A successful create only proves the record exists. To prove delivery:

1. Create a `once` schedule a minute or two ahead.
2. In Polpo Cloud, the schedule should report `driver.kind: "qstash"` and
   `driver.status: "registered"`. A failed registration shows an error; fix it rather than
   creating a duplicate.
3. Watch the run in `listScheduleRuns()` reach a final status, and check the side effect happened
   exactly once.
4. Trigger it manually twice with the same idempotency key and confirm you get one run.
5. Pause or delete test schedules afterwards so they do not fire later.

Do not attach cron strings to Missions for new work; Mission scheduling is the legacy path.
