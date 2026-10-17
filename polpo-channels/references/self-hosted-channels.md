# Self-Hosted Channels

Read this when running Channels in your own server rather than Polpo Cloud. The default
self-hosted server does not enable Channels; you embed the runtime and pass a `channels` option.

## Who Owns What

`@polpo-ai/channels` handles the transport: webhook challenges and signature checks (through
the official Vercel Chat SDK adapters), turning provider events into turns, de-duplication,
typing indicators, replies, provider limits, lazy media download, and burst/queue coordination.

Your host provides: credentials, durable shared state, choosing the installation for a webhook,
agent routing, Sessions, model and tool execution.

## Wiring

`PolpoServer` / `createApp` from `@polpo-ai/node` accept:

```ts
channels: {
  resolveInstallation,          // ChannelInstallationResolver: route key -> installation + credentials
  runtime,                      // new ChannelRuntime({ handleTurn, stateFactory, ... })
  management: { service, resolveScope },  // optional ChannelManagementService for the API/CLI
}
```

The server then accepts webhooks at `/v1/channel-webhooks/:provider/:routeKey`. Build
`handleTurn` with `createConversationChannelTurnHandler` from `@polpo-ai/server`, which maps each
turn to a canonical Session and runs the agent.

## Rules For A Correct Host

- Pick the installation **only** from the opaque route key in the webhook URL. Never from a
  phone number, workspace, or chat ID inside the payload, which is not yet verified.
- Pass the untouched request to the official adapter so it can verify the signature.
- Give every installation a stable ID and a credential revision. Increase the revision when
  credentials rotate so cached adapters are dropped.
- In-memory state is fine for one local process. With more than one process or replica, pass a
  shared, atomic `stateFactory` (normally Redis) for de-duplication, active-turn locks, queues,
  debounce, and suggestion selections. Otherwise users get duplicate or lost replies.
- Acknowledge provider webhooks quickly and run the agent outside the webhook request
  (`waitUntil` or a worker).
- A turn coordinator must call `execute()` at most once and durably record any queued or
  rejected decision.
- Observability hooks (`onEvent`) are best-effort and time-limited; their failure must not fail
  the turn. Redact credentials, tokens, media bytes, grants, and resolver output from logs.

## Suggestions On A Self-Hosted Channel

Set `suggestions: true` on `ChannelRuntime` and in the `createConversationChannelTurnHandler`
options (or pass an async resolver that decides per turn). Upgrade every worker to `0.17.2`
before enabling it, because older workers cannot read the queued selection format. A custom
completion adapter must keep `polpo.suggestions` and `polpo.suggestionsSource.assistantMessageId`
and provide the canonical SessionStore. The full selection protocol is described in the OSS
repository at `docs/channel-suggestions.md`.
