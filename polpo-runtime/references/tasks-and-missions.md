# Tasks And Missions

Tasks and Missions remain durable work-management resources. They are not substitutes for every
runtime primitive.

- Use a direct completion for one conversational turn.
- Use a Project Loop for deterministic multi-step execution inside one request/run.
- Use a Task for durable assigned work with status, retry, output, expectations, and activity.
- Use a Mission to coordinate a durable body of related Tasks, dependencies, checkpoints, and
  quality gates.
- Use a Schedule to trigger an agent, Loop, Task, Mission, or webhook at a time boundary supported
  by the current invocation contract.

## Task Safety

Create the task record before execution and persist status transitions monotonically. Expectations
such as file existence, tests, scripts, or review are verification gates; do not infer success
only from assistant text. Register produced artifacts through `register_outcome` so UI and APIs
can retrieve them without relying on ephemeral sandbox paths.

Retry only retryable failures and retain the original attempt/error history. Idempotency and
external side effects must be handled explicitly.

## Mission Safety

Validate dependency graphs and reject cycles or unknown nodes before starting. Persist checkpoints
and approvals so resume does not rerun completed work. Mission scheduling is legacy composition;
new time triggers should use Schedules and invoke the intended runtime surface explicitly.

Use current SDK types or server schemas for exact payloads. Do not copy old mission-centric
schedule shapes from aggregate `.polpo` files.
