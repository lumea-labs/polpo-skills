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

Message suggestions have `{ id, label, prompt }`, with optional `kind: "message"` for legacy
history. In 0.17.0, narrow `ChatSuggestion` before reading `prompt`: action items instead have
`kind: "action"` and either `{ type: "open_url", url }` or `{ type: "postback", value }` in `action`.
The consuming application owns link/postback handling and current authorization checks.

In `0.16.1+`, successful Loops populate suggestions too. `useChat` opts in by default;
set `suggestions: false` to disable, or use `{ maxItems: 5, guidance, context }`.
`sendMessage(text, { suggestions: options })` and
`continueToolResult(id, result, { idempotencyKey, loop, suggestions: options })`
accept per-turn overrides. Overrides replace hook defaults rather than mutating them. In
0.17.0 these options also accept caller-authored `actions`; actions appear first, count toward
`maxItems`, and are never executed by the hook. Send fresh actions on a continuation when the
application state changes.

State used as authoritative platform context must be set in the authenticated backend/proxy.
It guides generation but does not replace permission/quota checks when an action is performed.
Restore suggestions from the latest assistant message on reload; do not regenerate or offer
historical suggestions after a newer user message. Validate unknown history shapes and link
destinations before enabling controls; a TypeScript type is not a runtime trust check.

The independently released `@polpo-ai/chat` presentational `ChatSuggestions` uses
`{ text, icon? }` with a text-only selection callback. It cannot distinguish mixed items by
label safely: labels may repeat. Reuse a whole-item/ID callback component where available or
compose existing controls around `useChat`, preserving order and disabling selection while
busy. Display `label`, send the exact `prompt` only for a message, open a validated link only
on selection, and dispatch postbacks through an explicit application callback. Neither the
shared `Chat` nor Playground adapters gain this wiring from the SDK version bump alone.
