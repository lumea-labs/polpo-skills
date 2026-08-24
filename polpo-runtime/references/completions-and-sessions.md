# Completions And Sessions

Polpo exposes an OpenAI-compatible Chat Completions surface with namespaced extensions.

```ts
const response = await client.chatCompletions({
  agent: "support",
  messages: [{ role: "user", content: "Check this order" }],
  model: "openai/gpt-5-mini",
});
```

Use `x-session-id` or the SDK's `sessionId` for canonical conversation continuity. The server
persists messages and reconstructs history. Do not resend an isolated `role: "tool"` message or
manually splice stale history into a continuation.

## Concepts

- **Session**: canonical conversation history and pending interaction state.
- **Run**: one accepted execution with events, status, usage, tools, and terminal outcome.
- **Project Loop**: an execution graph selected explicitly or by an execution router.
- **Task/Schedule**: an invocation source that may create a Run and use an agent or Loop.

A direct conversational completion can still be a durable Run. "Durable" describes execution
and event persistence, not whether a Loop is present.

## Error Boundary

Validate and normalize messages before provider conversion:

- tool calls require a stable ID, name, and JSON arguments object/string accepted by the target
  contract;
- every prior tool call requires one matching result before the next model turn;
- duplicate IDs, orphan results, missing arguments, unsupported content parts, and empty prompts
  fail deterministically before provider invocation;
- provider schema incompatibility should return a diagnostic model error, not an opaque 500.

Persist only a coherent canonical turn. Never allow a partial stream or provider-specific chunk
to poison later Session history.
