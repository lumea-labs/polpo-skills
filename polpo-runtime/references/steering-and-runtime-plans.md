# Steering And Runtime Plans

## Steering

Steering is a run-scoped command queue with explicit admission and delivery outcomes:

```ts
const result = await client.steerRun(runId, {
  id: crypto.randomUUID(),
  mode: "steer",
  locale: "it-IT",
  content: { text: "Use the existing database schema." },
});

if (result.receipt.delivery === "pending") {
  const receipt = await client.getSteeringReceipt(runId, result.receipt.messageId);
  // delivered | too_late | cancelled | failed
}
```

`steer` becomes eligible at the next safe model/tool boundary. `follow_up` runs only when the
current work would otherwise stop. Message IDs are Run-scoped idempotency keys and delivery is
FIFO. Reusing an ID with different content is an error. A steering message never interrupts a
tool invocation in progress.

Read the public Run ID from `x-polpo-run-id` on supported completion responses. The HTTP and CLI
surfaces are `POST /v1/runs/{runId}/steering`,
`GET /v1/runs/{runId}/steering/{messageId}`, `polpo runs steer`, and
`polpo runs steering get`.

### Policy and receipts

Configure `steering.acceptance` as `accept`, `reject`, or `best_effort`. `best_effort` is the
default. A Project Loop resolves policy in this order: agent node, Project Loop, agent, trusted
project setting, platform default. Non-agent graph nodes do not consume a message; best-effort
messages may wait for the next agent node.

Keep receipt admission separate from delivery:

- admission: `accepted | duplicate | rejected | too_late`;
- delivery: `pending | delivered | too_late | cancelled | failed`.

`accept` admits only while an agent boundary can reserve a future model turn. `reject` declines
immediately. `best_effort` admits while the Run remains open and can later settle as `too_late`.
An optional BCP 47 `locale` selects deterministic policy outcome text. The receipt also carries
the configured `reply | return` action; the application decides how to render that outcome.

Persist the message and its initial receipt before acknowledging it. Include steering in Run
checkpoints and atomically seal the final boundary so accepted work cannot disappear as the Run
finishes. A distributed host must isolate queues and receipts by tenant, project, environment,
and Run, and keep final receipts readable after the active owner exits. Channels may queue,
steer, or reject new provider messages through the same host coordination policy.

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
