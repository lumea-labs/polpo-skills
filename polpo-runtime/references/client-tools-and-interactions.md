# Client Tools And Chat Interactions

## Request-Scoped Client Tools

Declare standard OpenAI function tools when the calling application owns the action:

```ts
const response = await client.chatCompletions({
  agent: "leo",
  messages: [{ role: "user", content: "Configure commerce" }],
  tools: [{
    type: "function",
    function: {
      name: "configure_site_module",
      description: "Open the module configuration UI.",
      parameters: {
        type: "object",
        properties: { module: { type: "string" } },
        required: ["module"],
        additionalProperties: false,
      },
      strict: true,
    },
  }],
  tool_choice: "auto",
  parallel_tool_calls: false,
});
```

Polpo returns the call and never executes it server-side. Client tools are direct-chat
capabilities and cannot be injected into an already-running Project Loop.

## Continuation

Use `continueWithToolResult` with the canonical Session ID/version, pending tool-call ID, and a
stable idempotency key. Omit `loop` to continue direct chat or set a fixed authorized Loop name to
transition into a durable Loop.

The continuation appends exactly one matching tool result, reconstructs canonical history, and
preserves trusted identity. Retries with the same key and payload are idempotent. Changed payload,
stale version, wrong scope, unknown call, or already-resolved call fails deterministically.

## Ask User And Suggestions

The agent controls whether interactions are permitted; the client opts into what it can render:

```ts
polpo: {
  capabilities: {
    ask_user_question: true,
    suggestions: true,
  },
}
```

`ask_user_question` may end a direct turn with `finish_reason: "ask_user"`. Continue with the
matching tool result, not a fabricated user/tool history pair.

Suggestions are generated after a successful response and contain only `id`, `label`, and exact
next-message `prompt`. Persist them on the assistant message that produced them. Offer them as
active only while that message is the latest Session message.
