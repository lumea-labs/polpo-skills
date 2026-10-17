# Completions And Sessions

## Requests

```ts
const response = await client.chatCompletions({
  agent: "support",
  messages: [{ role: "user", content: "Check order 1042" }],
  sessionId,               // omit to start a new Session
  user: currentUser.id,
});
```

Over HTTP, `POST /v1/chat/completions` with `Authorization: Bearer <key>` and the same body. Send
`x-session-id: <id>` to continue a Session; the response carries the Session ID to reuse.

The agent's configured model, instructions, and tools are used; change those in the agent
definition (`polpo-agents`), not per request. Per-request options live under `polpo`:

| Field | Effect |
|---|---|
| `polpo.skills` | Emphasise assigned skills for this request only. |
| `polpo.capabilities` | What your client can render: `ask_user_question`, `suggestions`. |
| `polpo.execution.allowedTools` | Narrow the tools for this request. It can never add tools. |
| `polpo.delivery.onDisconnect` | `"continue"` for durable runs, see [durable-runs.md](durable-runs.md). |

Other useful top-level fields: `user` (your end user's ID), `metadata` (up to 16 string
keys; Loops can read it as `request.metadata.<key>`; never shown to the model), `idempotencyKey`, `response_format`, `tools`, `tool_choice`.

## Streaming

```ts
const stream = client.chatCompletionsStream({ agent: "support", messages, sessionId });
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
// stream.sessionId, stream.sessionVersion, stream.runId are set once the server answers
```

Keep reading until the stream ends. Polpo may send extension chunks (for example suggestions)
after the last text.

## Sessions And Runs

- **Session**: the stored conversation, including pending questions or tool calls. Each change
  increments `sessionVersion`.
- **Run**: one accepted execution with events, status, usage, and a final outcome.
- **Project Loop**: a workflow the run executes, chosen explicitly or by the agent's router.
- **Task / Schedule**: other ways to start a run.

A plain chat turn can still be a durable run; "durable" is about delivery, not about Loops.

## What The Server Rejects

The server validates messages before calling the model. Expect a 4xx error, not a model answer,
when you send: a tool call without an ID, name, or JSON arguments; a tool result whose call ID
does not match a pending call; duplicate tool call IDs; unsupported content parts; or an empty
prompt. A model provider's schema rejection comes back as a readable model error. If you see one
of these, fix the request instead of retrying it.
