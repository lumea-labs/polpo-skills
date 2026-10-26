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

When a request-scoped client tool remains unresolved, inspect its durable resolution rather than
inferring state from the last browser response. Continue it when the agent must resume. Settle it
when the application must record a terminal result without another generation. Both paths use the
canonical Session version and a stable idempotency key; neither is a reason to splice a handcrafted
assistant/tool pair into history.

## Automatic titles and live metadata

A new conversation is named asynchronously from its first persisted user message. An open completion stream may include `polpo.session` with `id`, `title`, `titleSource`, `titleRevision`, `titleUpdatedAt`, `titleGenerationStatus`. Its assistant delta is empty: do not append the title to response text. Project SSE emits `session:updated` with `{ session }`. A title finishing after `[DONE]` is persisted, never appended to the closed stream/journal.

Use `client.getSessionMetadata(id)` (`GET /v1/chat/sessions/{id}`) or `client.watchSessionTitle(id, callback)` for late updates. The latter deduplicates reads, backs off, and stops on terminal state, auth failure, deletion, unsubscribe or 60s. Keep client/project/environment scope fixed and unsubscribe on navigation. Only apply newer `titleRevision`; it is independent of transcript `version`.

`client.renameSession(id, title, expectedTitleRevision?)` returns `{ renamed: true, session }`. A manual rename wins even when identical to the provisional string; revision mismatch returns `409 SESSION_TITLE_REVISION_CONFLICT`. Titles do not represent Run status. Title failure leaves the fallback and never fails the main completion. Standard auxiliary model usage applies without another agent Run.
