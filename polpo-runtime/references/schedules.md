# Schedules

Schedules are durable invocation definitions, not cron strings attached to legacy Missions.

## Timing

- `kind: "cron"` defines a recurring schedule with expression and timezone.
- `kind: "once"` defines one future ISO-8601 instant and optional timezone context.

## Invocation

The invocation selects a supported runtime surface such as an agent, Project Loop, task, or
webhook and carries bounded JSON payload. Do not encode credentials in the payload.

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
