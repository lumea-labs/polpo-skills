# Custom Hosts And Stores

Read this only when you embed the Polpo runtime in your own server (`PolpoServer` or
`createApp` from `@polpo-ai/node`), write your own store implementations, or wire your own
scheduler or Channel workers. Applications that only call Polpo Cloud or the stock self-hosted
server do not need any of this; the runtime already does it.

## Run Delivery

- Store run status, final outcome, cancellation, and replayable events so a subscriber can never
  see a run as finished while events are still missing.
- Run agent work in workers that outlive the HTTP request that started it.
- Keep sandbox lease, Loop checkpoint, steering queue, Session version, trusted context, and
  idempotency state together so a resumed run picks up exactly where it stopped.
- An in-memory event store survives a dropped client but not a process restart. Use a shared
  store (the Drizzle/Postgres stores) for multi-process or production deployments.

## Steering

Persist each steering message and its first receipt before acknowledging it. Keep the queue in
run checkpoints and close it atomically when the run finishes, so an accepted message cannot be
silently dropped. The built-in registry is single-process; a distributed host needs durable
steering and receipt storage scoped by tenant, project, environment, and run, with final
receipts still readable after the run's owner exits.

## Runtime Hooks

Embed the server with a `runtimeHookHost` to support `tool`, `mcp_tool`, `prompt`, `agent`, and
Connection-authenticated `http` handlers (`resolveHttpHeaders`). For durable replay, provide
`findCompleted` so a resumed run reuses stored hook decisions instead of re-running handlers.
Return real handler support from the capabilities route instead of the portable default.

## Schedules

A schedule driver must create a durable Schedule Run with a provider-safe idempotency key,
create the Session before inserting messages, count attempts, store the final status, and keep
provider delivery IDs or callback errors. Reconciliation retries failed or pending driver state
without delivering twice.

## Message Validation

If you write your own completion adapter, validate before calling a provider: every tool call
has an ID, name, and JSON arguments; every earlier tool call has exactly one result; duplicate
IDs, orphan results, unsupported parts, and empty prompts are rejected. Persist only complete,
coherent turns, so a partial stream can never corrupt Session history. Convert provider errors
into stable Polpo errors that keep the useful diagnostic.

## Structured Output

Sanitize JSON Schemas for the target provider before submission and return a diagnostic naming
the incompatible path and keyword. When streaming structured output, buffer until the value is
complete and valid, then emit it once.

## Guardrails

Hosts may inject process-local guardrail policies and credentials through private adapters.
Keep user-authored regular expressions and private classifier prompts out of serializable
project settings. Enforce private-network blocking at network egress after DNS resolution as
well, to prevent DNS rebinding.

## Tasks And Missions

Create the task record before execution, keep status transitions monotonic, retain attempt and
error history on retry, validate Mission dependency graphs (no cycles or unknown nodes) before
starting, and persist checkpoints and approvals so a resume does not rerun completed work.
