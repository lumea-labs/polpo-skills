# Client Tools And Chat Interactions

## Request-Scoped Client Tools

Declare standard OpenAI function tools when the calling application owns the action:

```ts
const direct = client.chatCompletionsStream({
  agent: "support",
  messages: [{ role: "user", content: "Change my notification settings" }],
  tools: [{
    type: "function",
    function: {
      name: "open_settings_panel",
      description: "Open a settings panel in the app.",
      parameters: {
        type: "object",
        properties: { panel: { type: "string" } },
        required: ["panel"],
        additionalProperties: false,
      },
      strict: true,
    },
  }],
  tool_choice: "auto",
  parallel_tool_calls: false,
});
```

Polpo returns the tool call to you and never runs it on the server.

## Continuation

Use a stream for the first request: only `ChatCompletionStream` exposes the `sessionId` and
`sessionVersion` that a continuation needs. Collect the tool call from the chunks
(`delta.tool_calls`), run the tool in your app, then send its result. Do not add the assistant
and tool messages to `messages` yourself:

```ts
for await (const chunk of direct) {
  // render text; accumulate chunk.choices[0]?.delta?.tool_calls into `call`
}
const result = await openSettingsPanel(JSON.parse(call.function.arguments));

const next = client.continueWithToolResult({
  agent: "support",
  sessionId: direct.sessionId!,
  sessionVersion: direct.sessionVersion!,   // a stale version is rejected
  toolCallId: call.id,
  result: JSON.stringify(result),
  idempotencyKey: `settings-${call.id}`,
  // loop: "apply-settings",       // optional: continue into an assigned Project Loop
});
for await (const chunk of next) { /* stream the agent's reply */ }
```

Retrying with the same key and the same result is safe. A different result under the same key,
a stale `sessionVersion`, an unknown call ID, or a call that was already answered is rejected.
Request-declared client tools are rejected when the request sets a `loop`, and must not be
declared again on a continuation.

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

Message suggestions contain `id`, `label`, and the exact next-message `prompt`. From 0.17.0,
application actions can join the same list as described below. Polpo persists the list on the
assistant message that produced it; offer it as active only while that message is latest.

## Loop Completion Suggestions (0.16.1+)

Suggestions are also generated after successful Project Loops, using their final guarded
presentation and the Session conversation. The same array is persisted on the assistant
message and streamed in a root `polpo.suggestions` chunk before `stop` and `[DONE]`.
Durable replay returns the original array; it does not regenerate it.
Keep consuming after the final text until terminal events arrive: the auxiliary generation
may still be running. Suggestion generation gives up after 15 seconds; the main answer is kept.

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
handoff too. No suggestions are generated while waiting for a client tool, on structured
responses, or after a failed/aborted turn. Auxiliary failure/timeout is fail-open.
Channel turns require explicit host opt-in and 0.17.2 or later for shared-queue
selection admission across replicas; older or unconfigured hosts remain disabled.
Channel questions remain unsupported. The additive
`polpo.suggestionsSource.assistantMessageId` identifies the persisted owner of a
returned list; custom Channel completion adapters must preserve it with the list.

## Application Actions (0.17.0+)

The authenticated application backend supplies deterministic actions; the model generates
only messages. For example, add this to the suggestion options above:

```ts
actions: [
  { kind: "action", id: "publish", label: "Publish the site",
    action: { type: "open_url", url: "https://app.example.com/sites/123/publish" } },
  { kind: "action", id: "plan", label: "View plan",
    action: { type: "postback", value: "billing:open" } },
]
```

Actions appear first in caller order; model messages fill the remaining slots within the
total `maxItems` budget. An all-action list needs no auxiliary inference. Valid static actions
survive optional model failure, but explicit opt-out, cancellation and ineligible turns do not
publish them. Actions never enter the generator prompt and Polpo never executes them.

An explicit `actions` array, including `[]`, produces a typed list: `kind: "message"` plus
`prompt`, or `kind: "action"` plus `action`. Without `actions`, new responses keep the legacy
kind-free message shape. Stored history can contain actions created by another client, so
always narrow the public `ChatSuggestion` union before reading `prompt`.

Only absolute HTTPS links without credentials, whitespace or backslashes are accepted.
Supply at most five actions; IDs are unique (64 characters), labels are at most 64 characters,
URLs 2048 and opaque postback values 2000. Missing IDs are allocated in request order without
colliding with caller IDs. They identify display items, not permission grants. Postback values
are preserved exactly; the application authenticates and rechecks current permissions when
handling the selection. Do not send postback values as user messages or tool results.

Actions are request state, not agent-directory or CLI configuration. Send an updated action
list through `continueWithToolResult` capabilities when a client tool changes application
state; the previous request's actions are not inherited automatically. Live SSE, immediate
Session history and durable replay contain the same persisted combined list.
