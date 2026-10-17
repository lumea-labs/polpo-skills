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

## Tasks

Create with `client.createTask({ ... })`. Give the task expectations (files that must exist,
tests or scripts that must pass, a review) so success is checked, not assumed from the agent's
final message. Ask agents to register produced files with the `register_outcome` tool; sandbox
paths disappear, registered outcomes stay retrievable from the API and UI.

Retry only failures marked retryable; the previous attempts and errors stay in the history. If
the task has external side effects (emails, payments), make them idempotent yourself.

## Missions

Create with `client.createMission({ ... })`. The runtime rejects dependency cycles and unknown
tasks before starting, and resumes from checkpoints without rerunning finished tasks. For new
time-based triggers use Schedules, not mission scheduling.

Use current SDK types or server schemas for exact payloads. Do not copy old mission-centric
schedule shapes from aggregate `.polpo` files.
