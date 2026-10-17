# Steering And Runtime Plans

## Steering

Steering sends a message to a run that is already working, for example to correct its course
without starting over. It never interrupts a tool that is running.

```ts
const result = await client.steerRun(runId, {
  id: crypto.randomUUID(),          // idempotency key, unique within the run
  mode: "steer",                    // or "follow_up"
  locale: "it-IT",                  // optional: language for policy replies
  content: { text: "Use the existing database schema." },
});

if (result.receipt.admission === "accepted" && result.receipt.delivery === "pending") {
  // later, or after the run ends:
  const receipt = await client.getSteeringReceipt(runId, result.receipt.messageId);
}
```

- `steer` is applied at the next safe point between model and tool steps.
- `follow_up` is applied only when the agent would otherwise finish.
- The run ID comes from `stream.runId` or the `x-polpo-run-id` response header.
- Resending the same `id` with the same content returns the same receipt (`duplicate`); with
  different content it is rejected.
- CLI: `polpo runs steer <run-id> --message "..." [--mode follow_up] [--locale it-IT]`,
  `polpo runs steering get <run-id> <message-id>`, `polpo runs abort <run-id>`.
- HTTP: `POST /v1/runs/{runId}/steering`, `GET /v1/runs/{runId}/steering/{messageId}` (Cloud;
  `/api/v1/runs/...` on a self-hosted server).

### Receipts

A receipt has two separate answers. Show the user both:

| Field | Values | Meaning |
|---|---|---|
| `admission` | `accepted`, `duplicate`, `rejected`, `too_late` | Whether the run took the message now |
| `delivery` | `pending`, `delivered`, `too_late`, `cancelled`, `failed` | Whether the agent eventually saw it |

When the policy rejects a message or it arrives too late, `receipt.response` may carry a
localized text and an action: `reply` (show it to the user) or `return` (hand it back to your
app). Your app decides how to display it.

### Steering Policy

Agents, Project Loops, and individual agent nodes in a Loop can set:

```json
{
  "steering": {
    "acceptance": "best_effort",
    "outcomes": {
      "rejected": { "action": "reply", "messages": { "en": "This step can't take new instructions.", "it": "Questo passaggio non accetta istruzioni." } },
      "too_late": { "action": "return", "messages": { "en": "Already finished." } }
    }
  }
}
```

- `best_effort` (default): accept while the run is open; it may later settle as `too_late`.
- `accept`: accept only when the agent can still take another model turn.
- `reject`: always decline. Use it on Loop nodes where new instructions would break the workflow.

The most specific policy wins: Loop agent node, then Loop, then agent, then project, then the
platform default. Non-agent Loop steps never consume messages; a best-effort message waits for
the next agent node. Messages: up to 64 KiB of content, 16 attachments, 100 pending per run;
outcome texts: up to 32 locales.

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
