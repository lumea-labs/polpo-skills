---
name: polpo-react
description: Build React and Next.js interfaces for Polpo agents with `@polpo-ai/react` (`PolpoProvider`, `useChat`, `useSessions`, `useAgents`) and the `@polpo-ai/chat` components. Covers chat screens and support widgets, session lists, streaming and reconnecting, file attachments, ask-user questions, suggestion chips and action buttons, client-side tools rendered in the UI, agent pickers, Development/Production switching, theming and dark mode, scaffolding with `create-polpo-app` or `polpo create --template`, and keeping the API key out of the browser. Use this whenever someone builds or debugs a front end that talks to a Polpo agent, even if they only say "add a chat to my app" in a project that uses Polpo.
---

# Polpo React

`@polpo-ai/react` holds the runtime state and hooks. `@polpo-ai/chat` holds ready-made UI
components. Your app keeps routing and any business logic a client tool performs.

## Start

New app:

```bash
npx create-polpo-app my-chat -t chat -y      # or: polpo create --template chat
```

Existing app:

```bash
npm install @polpo-ai/react @polpo-ai/sdk @polpo-ai/chat react-virtuoso lucide-react streamdown
# or copy component source: npx @polpo-ai/ui add
```

## Provider And The API Key

```tsx
import { PolpoProvider } from "@polpo-ai/react";

// Requests go to your own proxy route; apiPrefix="/v1" when the proxy forwards to Polpo Cloud
<PolpoProvider baseUrl="/api/polpo" apiPrefix="/v1" autoConnect={false}>
  {children}
</PolpoProvider>
```

`baseUrl` is an origin or your proxy path. Do not append `/v1` or `/api/v1`. The SDK picks the
prefix from the host name (`/v1` for `*.polpo.sh` and `*.polpo.cloud`, `/api/v1` otherwise), so
behind a proxy set `apiPrefix` yourself: `/v1` for Cloud, leave it out for a self-hosted runtime.

The project API key gives full access to the project, so it must not reach the browser. Put a
server route (for example a Next.js route handler at `/api/polpo/[...path]`) in front of Polpo
that authenticates your user, adds `Authorization: Bearer <POLPO_API_KEY>`, and forwards the
request; [references/patterns.md](references/patterns.md) has an example. The scaffolded
templates write `NEXT_PUBLIC_POLPO_API_KEY` to `.env.local` for quick local demos; replace that
with the proxy before deploying.

## Pick The Level

- `<Chat agent="support" sessionId={sessionId} />` for an ordinary chat screen.
- `useChat` directly when you need durable delivery, client-side tools, custom question or
  suggestion rendering, Loop continuation, or your own layout.

## Rules For A Correct Chat UI

- The Session stored by Polpo is the source of truth. After a reconnect or a tool continuation,
  show the server's messages; do not also keep optimistic copies, or messages appear twice.
- Show `reconnecting` differently from `streaming`, and do not mark a detached durable run as
  failed.
- Render and run a client tool only if its name is in your local registry and its arguments
  pass your validation; otherwise show an error.
- Send tool results with `continueToolResult` and a stable idempotency key.
- Suggestions belong to the answer that produced them; disable them once a newer message
  exists. Check `kind` before reading `prompt`: actions (links, postbacks) are handled by your
  app and never sent as chat messages.
- Send attachments as typed content parts and show files through an authenticated URL, never a
  server file path.

## References

- [references/runtime-chat.md](references/runtime-chat.md): `useChat` options, durability,
  skills, tool continuation, suggestions.
- [references/components.md](references/components.md): component props.
- [references/patterns.md](references/patterns.md): working examples.
- [references/cli.md](references/cli.md): `create-polpo-app` and `@polpo-ai/ui`.
- [references/theming.md](references/theming.md): colours, dark mode, fonts, Tailwind.
- [references/project-environments.md](references/project-environments.md): `environment` prop
  and switching between Development and Production.
- [references/contract-version.md](references/contract-version.md): checked versions.
