# Durable Runs And Reconnect

By default a run stops when the client disconnects. Ask for durable delivery when work is long
or the client is unreliable (mobile, serverless functions, browser tabs):

```ts
const stream = client.chatCompletionsStream({
  agent: "builder",
  messages: [{ role: "user", content: "Build and test the app" }],
  polpo: { delivery: { onDisconnect: "continue" } },
});
```

The response includes the run ID (`stream.runId`, header `x-polpo-run-id`). Every stored event has
an increasing ID; the SDK keeps the last one in `stream.lastEventId`.

## Reconnecting

On a network error, reattach from the last event you fully processed:

```ts
stream.resume({ after: stream.lastEventId ?? undefined });
```

Over HTTP: `GET /v1/runs/{runId}/events` with the last event ID. **Never send the original
completion request again**; that starts a second run and duplicates side effects.

Reconnect with a capped backoff. If the run has already failed or the cursor is rejected as
expired or invalid, stop and show the error instead of looping.

## Stopping

- `stream.detach()`: stop listening; the run keeps going.
- `stream.cancel(reason)`: ask the server to cancel the run. Safe to call twice.
- `stream.abort()`: older behaviour that also cancels.

## Limits

How long events are kept depends on the host. If the self-hosted runtime has no durable run
store configured, events survive a dropped connection but not a server restart.
