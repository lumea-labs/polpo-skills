# Durable Runs And Reconnect

Durable delivery is opt-in for backwards compatibility:

```ts
const stream = client.chatCompletionsStream({
  agent: "builder",
  messages: [{ role: "user", content: "Build and test the app" }],
  polpo: { delivery: { onDisconnect: "continue" } },
});
```

The accepted response exposes `x-polpo-run-id`. Persisted SSE frames have monotonic IDs. On a
transport failure, reconnect to `GET /v1/runs/{runId}/events` after the last complete cursor.
Never recreate the completion request.

## Client Controls

- `stream.detach()` closes only this subscriber; the durable run continues.
- `stream.cancel(reason)` requests idempotent server-side cancellation.
- `stream.abort()` retains the historical cancellation behavior.
- `stream.resume({ after })` attaches to an existing run after a known cursor.

Reject invalid, ahead, malformed, or expired cursors explicitly. A terminal failure is final and
must not trigger an infinite reconnect loop. Event retention is host-defined; in-memory fallback
survives a subscriber disconnect but not a process restart.

## Production Requirements

- Persist run status, terminal outcome, cancellation, and replay events atomically enough that a
  subscriber cannot observe a terminal gap.
- Separate execution workers from the HTTP/SSE request lifetime.
- Use bounded reconnect with jitter and surface the terminal reason.
- Preserve sandbox, Loop checkpoint, steering queue, Session version, trusted context, and
  idempotency state across resume.
