# Steering And Runtime Plans

## Steering

Steering sends a message to a run that is already working, for example to correct its course
without starting over:

```ts
await client.steerRun(runId, {
  id: crypto.randomUUID(),
  mode: "steer",
  content: { text: "Use the existing database schema." },
});
```

`steer` becomes eligible at the next safe model/tool boundary. `follow_up` runs only when the
current work would otherwise stop. Message IDs are idempotent and FIFO. A steering message never
interrupts a tool invocation in progress.

Use a new `id` per message; resending the same ID is ignored, so retries are safe. Messages
are applied in order. `stream.runId` (or the `x-polpo-run-id` header) gives you the run ID.

## Runtime Plans

A runtime plan explains what the runtime decided for a run before it started. Use it to debug
"why did it pick this model / Loop / tool set". It is emitted as a run event and stored with the
run, and contains:

- surface and invocation source;
- selected direct/Loop mode and model/profile source;
- effective tool exposure and policy sources;
- sandbox and guardrail references;
- safe routing reasons and labels.

Plans never contain prompts, messages, credentials, or retrieved content, so they are safe to
log. They arrive as `runtime:plan` events on the project event stream (`/v1/events`, or
`useEvents` in React); `isRuntimePlanSSEEvent(event)` from the SDK identifies them. They are not
part of the completion chunks.
