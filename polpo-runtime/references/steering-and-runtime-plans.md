# Steering And Runtime Plans

## Steering

Steering is a run-scoped durable command queue:

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

Persist the queue with run checkpoints and atomically seal the final boundary so an accepted
message cannot disappear while a run is finishing. Channels may queue, steer, or reject new
provider messages through the same host coordination policy.

## Runtime Plans

A runtime plan is an immutable, serializable explanation of resolved execution decisions:

- surface and invocation source;
- selected direct/Loop mode and model/profile source;
- effective tool exposure and policy sources;
- sandbox and guardrail references;
- safe routing reasons and labels.

Never include prompts, messages, credentials, provider headers, private classifier prompts, or
retrieved sensitive content. Emit plans for inspection before provider/tool setup and preserve
the selected plan with the Run.
