# Schedules

Schedules are durable invocation definitions, not cron strings attached to legacy Missions.

Store deployable definitions in `.polpo/schedules/*.json`. `polpo deploy` preflights every file,
validates referenced local agents and Project Loops, rejects duplicate explicit IDs before the
first network mutation, and then provisions the schedules. The old `missionId`/`expression`
shape remains a compatibility input, not the preferred contract.

## Timing

- `kind: "cron"` defines a recurring schedule with expression and timezone.
- `kind: "once"` defines one future ISO-8601 instant and optional timezone context.

## Invocation

The invocation selects one of these runtime surfaces and carries bounded JSON payload. Do not
encode credentials in the payload.

- `agent`: `agentName`, prompt or messages, optional new/reused Session, and optional execution
  overrides such as Project Loop, model, sandbox, guardrails, and metadata.
- `task`: `agentName`, title, prompt, optional external user and execution overrides.
- `channel`: either a proactive `send` or an `agent_reply`, with Channel/Route/thread identity.
- `webhook`: a configured `webhookId` and JSON payload.
- `legacy_mission`: compatibility only.

A Project Loop is selected through `invocation.execution.loop`; it is not a separate schedule
surface.

## Lifecycle

Creation is successful only when the schedule record and driver state make the outcome explicit.
For managed QStash operation, expect driver `kind: "qstash"` and `status: "registered"` before
treating provisioning as complete. A failed provider registration must surface its stable error
and remain reconcilable without creating duplicate delivery.

Schedule execution creates a durable Schedule Run with an idempotent provider-safe key. The
worker must create the Session before inserting messages, increment attempts, persist terminal
status, and retain provider delivery IDs or callback errors.

Use a caller idempotency key for manual triggers. Reconciliation should retry failed or pending
driver/run state without duplicating already accepted provider work.

## API And Concurrency

- `GET|POST /v1/schedules` lists or creates schedules.
- `GET|PATCH|DELETE /v1/schedules/{scheduleId}` reads or mutates one schedule.
- `POST /v1/schedules/{scheduleId}/pause|resume` changes lifecycle state.
- `GET /v1/schedules/{scheduleId}/runs` returns durable execution history.
- `POST /v1/schedules/{scheduleId}/runs` accepts `{ "idempotencyKey": "..." }` and creates one
  manual run.

Use the current `revision` as `If-Match` for update, delete, pause, and resume when concurrent
writers are possible. A stale revision must return a conflict rather than overwrite a newer
schedule. Reusing a manual-trigger idempotency key must return the same accepted work, not create
a second run.

## Production Verification

Test the complete provider path, not only the CRUD response:

1. Create one future `once` schedule and one `cron` schedule.
2. Require `driver.kind: "qstash"` and `driver.status: "registered"` in managed Cloud.
3. Observe the due run move through attempts to a terminal state and verify the target side
   effect or callback exactly once.
4. Retry the same manual trigger key and confirm run identity is unchanged.
5. Exercise pause/resume, stale `If-Match`, reconciliation, malformed timezone/timing, and a
   provider registration failure.
6. Delete or pause UAT schedules after the test so they cannot fire later.
