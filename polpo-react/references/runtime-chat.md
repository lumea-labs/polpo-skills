# Runtime Chat

```tsx
const chat = useChat({
  agent: "builder",
  sessionId,
  durable: true,
  onSessionCreated: setSessionId,
  onToolCall: inspectToolCall,
  onSuggestions: setSuggestions,
});
```

The hook exposes:

- `messages`, `sendMessage`, `sessionId`, `sessionVersion`, and `setSessionId`;
- `status`: `idle`, `loading`, `streaming`, `reconnecting`, or `error`;
- `pendingToolCall`, `sendToolResult`, and `continueToolResult`;
- `suggestions`, `runId`, `lastEventId`, `detach`, `cancel`, and `abort`.

## Durable Delivery

`durable: true` lets the run continue after an SSE disconnect. The SDK reconnects from the last
complete event cursor. Unmounting detaches the subscriber; call `cancel()` for acknowledged
server cancellation. Never resend the original user message during reconnect.

## Message Skills

Apply an assigned skill to one message:

```tsx
await chat.sendMessage("Build the settings page", {
  skills: ["frontend-design"],
});
```

This selection is additive and ephemeral. A slash command is client syntax; translate it into
the `skills` option rather than sending `/skill-name` and expecting server parsing.

## Client Tool Continuation

When `pendingToolCall` is present, execute only a locally registered handler. Continue direct
chat or an explicit Loop:

```tsx
await chat.continueToolResult(call.toolCallId, JSON.stringify(result), {
  idempotencyKey,
  loop: "build-site",
});
```

Retain the same idempotency key for retries. Do not append a handcrafted assistant/tool pair to
the message array.

## Suggestions

Runtime suggestions have `{ id, label, prompt }`. `@polpo-ai/chat`'s presentational
`ChatSuggestions` component uses `{ text, icon? }`; adapt `label` to `text` and send `prompt` on
selection rather than assuming label and prompt are identical.
