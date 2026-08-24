---
name: polpo-react
description: Build React interfaces for Polpo agents with @polpo-ai/react and @polpo-ai/chat. Use for chat components, Sessions, durable reconnect, attachments, ask-user interactions, suggestions, client tool rendering and continuation, agent selection, or Polpo UI theming.
---

# Polpo React

Use `@polpo-ai/react` for runtime state and hooks. Use `@polpo-ai/chat` for composable UI.
Keep application routing and business-side client tool execution in the consuming app.

## Install

```bash
npm install @polpo-ai/chat @polpo-ai/sdk @polpo-ai/react \
  react-virtuoso lucide-react streamdown
```

Or add source components with `npx @polpo-ai/ui add`. For a new application use
`npx create-polpo-app`.

## Provider

```tsx
import { PolpoProvider } from "@polpo-ai/react";

<PolpoProvider baseUrl={process.env.NEXT_PUBLIC_POLPO_URL!} autoConnect={false}>
  {children}
</PolpoProvider>
```

`baseUrl` is the project root; do not append `/v1` or `/api/v1`. Do not expose privileged
server API keys in browser bundles. Use the application's authenticated backend/proxy when
credentials must remain server-side.

## Chat Choice

Use the high-level component for ordinary chat:

```tsx
<Chat agent="support" sessionId={sessionId} />
```

Use `useChat` directly when the product needs durable delivery, custom interactions, explicit
client tools, Loop continuation, or its own message composition.

## UI Invariants

- Treat Session history from Polpo as canonical; do not duplicate optimistic messages after
  reconnect or client-tool continuation.
- Show `reconnecting` separately from `streaming` and do not mark detached durable runs failed.
- Render a client tool only after validating its name and arguments against the local handler.
- Continue tool results with a stable idempotency key and current Session version.
- Suggestions belong to the assistant message that produced them and are actionable only while
  it remains the latest message.
- Attachments use typed content parts and authenticated file URL resolution; never place local
  filesystem paths in browser-visible messages.

## References

- [references/runtime-chat.md](references/runtime-chat.md): modern `useChat`, durability,
  interactions, skills, and continuation.
- [references/components.md](references/components.md): component props.
- [references/patterns.md](references/patterns.md): current composition patterns.
- [references/cli.md](references/cli.md): UI scaffolding commands.
- [references/theming.md](references/theming.md): tokens, dark mode, fonts, and Tailwind.
- [references/contract-version.md](references/contract-version.md): verified package versions.
