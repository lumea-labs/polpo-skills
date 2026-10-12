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

## Loop Completion Suggestions (0.16.1+)

Suggestions are also generated after successful Project Loops, using their final guarded
presentation and the Session conversation. The same array is persisted on the assistant
message and streamed in a root `polpo.suggestions` chunk before `stop` and `[DONE]`.
Durable replay returns the original array; it does not regenerate it.

Keep `suggestions: true`, or pass request-scoped options:

```ts
polpo: { capabilities: { suggestions: {
  enabled: true,
  maxItems: 5,
  guidance: "Site just created. Help personalize it.",
  context: { published: false, unpublishedChanges: true, modificationsLeft: 2 },
} } }
```

An object opts in unless disabled. Agent `chat.suggestions.enabled` and hosted policy still
apply. Count is 2–5, default 3; the request count overrides the agent count. Request guidance
adds to static agent guidance (500 characters each). Context is JSON limited to 8192 serialized
characters, 8 nesting levels and 1024 values. Supply it through the authenticated application
backend, omit secrets, and treat it as a snapshot: a long Loop can outlive that state.
These are generation hints, not authorization or a hard guarantee about generated wording.
Enforce quotas and current action permissions in the application's handlers.

`continueWithToolResult({ ..., capabilities: { suggestions: true } })` opts in on a client-tool
handoff too. No suggestions are generated while waiting for a client tool, on Channel turns,
on structured responses, or after a failed/aborted turn. Auxiliary failure/timeout is fail-open.
Actions/URLs/postbacks are not suggestion items in this version.
