---
name: polpo-runtime
description: Call and operate Polpo agents from application code with `@polpo-ai/sdk` or the OpenAI-compatible `/v1/chat/completions` API. Covers SDK setup, Sessions and conversation history, streaming and durable runs that survive disconnects, client-side tools and tool-result continuation, ask-user questions, suggestions and action buttons, structured JSON output, steering a running agent, Project Loops (`defineProjectLoop`), schedules, tasks and missions, guardrails, and application databases through `client.data()`. Use this whenever code calls a Polpo agent or a user debugs a Polpo run (lost stream, duplicated messages, tool call errors, a schedule that did not fire), even if they only say "call the agent from my backend". For agent configuration use polpo-agents; for React UI use polpo-react.
---

# Polpo Runtime

Polpo serves agents through an OpenAI-compatible Chat Completions API with Polpo extensions under
a `polpo` field. Four ideas keep integrations correct:

- A **Session** is the conversation history. The server stores it; you pass its ID.
- A **Run** is one execution, with its own events and final status.
- A **Project Loop** is a fixed multi-step workflow an agent can run.
- **SSE** is only how events reach you. Losing the connection does not have to lose the run.

## Connect

```ts
import { PolpoClient } from "@polpo-ai/sdk";

const client = new PolpoClient({
  baseUrl: process.env.POLPO_URL!,        // https://<slug>.polpo.cloud or http://localhost:3890
  apiKey: process.env.POLPO_API_KEY!,     // server-side only
});

const reply = await client.chatCompletions({
  agent: "support",
  messages: [{ role: "user", content: "Where is order 1042?" }],
  user: currentUser.id,                   // your end user's ID, used for Memory and grants
});
```

The SDK adds `/v1` for Polpo Cloud hosts and `/api/v1` for others; pass only the origin. Keep the
API key on the server. Browsers should go through your backend (see `polpo-react`).

## Workflow

1. Decide what kind of call this is: one chat turn, a Project Loop (fixed steps), a durable task,
   or a schedule. See [references/tasks-and-missions.md](references/tasks-and-missions.md).
2. For multi-turn chat, reuse the Session ID the server returned (`sessionId` in the SDK, header
   `x-session-id` over HTTP). Send only the new user message; the server rebuilds the history.
3. If the work is long or the client may disconnect, ask for durable delivery and reconnect to
   the run's event log on failure. Never send the original request again: that starts a second
   run.
4. When the agent calls a client-side tool, run it in your app and send the result with
   `continueWithToolResult`, using a stable idempotency key.
5. Use an idempotency key on anything retried: tool continuations, manual schedule triggers,
   database writes.
6. Decide success from the final event and the persisted Session or run status, not from the
   last text chunk.

## Rules That Prevent Common Bugs

- Do not build the message history yourself for a continuing conversation, and never send a
  `role: "tool"` message on its own. Use the Session and `continueWithToolResult`.
- Client-side tools you declare in a request are returned to you and never executed by Polpo.
  Set `parallel_tool_calls: false` when you send them.
- An explicit Loop continuation keeps the Session and trusted user context but recalculates tool
  permissions for the Loop.
- Steering messages are applied at the next safe point. They never interrupt a running tool.
- Application databases are separate from Sessions, Memory, and file volumes. Use them through
  `client.data()` with the server API key; agents get separate, narrower grants.

## References

- [references/completions-and-sessions.md](references/completions-and-sessions.md): requests,
  Sessions, streaming, errors.
- [references/durable-runs.md](references/durable-runs.md): surviving disconnects, cancel.
- [references/client-tools-and-interactions.md](references/client-tools-and-interactions.md):
  client tools, ask-user questions, suggestions, action buttons.
- [references/structured-and-parallel.md](references/structured-and-parallel.md): JSON output and
  parallel tool calls.
- [references/project-loops.md](references/project-loops.md): defining and running Loops.
- [references/steering-and-runtime-plans.md](references/steering-and-runtime-plans.md): steering a
  run and inspecting runtime decisions.
- [references/schedules.md](references/schedules.md): cron and one-off schedules.
- [references/tasks-and-missions.md](references/tasks-and-missions.md): picking the right primitive.
- [references/context-trust-and-guardrails.md](references/context-trust-and-guardrails.md):
  guardrail packs and prompt-injection protection.
- [references/application-data.md](references/application-data.md): `client.data()`, SQL,
  migrations.
- [references/custom-hosts.md](references/custom-hosts.md): only for people embedding the runtime
  in their own server or writing custom stores.
- [references/contract-version.md](references/contract-version.md): checked version and minimums.
