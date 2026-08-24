---
name: polpo-channels
description: Build, provision, configure, and debug Polpo messaging Channels for WhatsApp, Telegram, Slack, and Discord. Use for Connection/Channel/Route setup, verified webhooks, media and voice, message bursts, delivery, trusted identity resolution, Channel client tools, session routing, proactive sends, or provider-specific behavior.
---

# Polpo Channels

Polpo Channels is a provider-neutral OSS runtime built on official Vercel Chat SDK adapters.
Keep transport handling separate from agent execution and managed provisioning.

## Resource Model

- A **Connection** stores project-scoped provider authorization and credentials.
- A **Channel** represents one installed provider destination.
- A **Route** grants an agent access to that Channel and may narrow tools or destination.
- A **setup** is temporary authorization or provider-verification state.

Never mark a Channel active before required provider verification succeeds. Never select
credentials or routing from an unverified webhook body.

## Workflow

1. Inspect provider capabilities and existing Connections, Channels, and Routes.
2. Provision idempotently through CLI/API/MCP using Connection references, never inline secrets.
3. Complete callback verification or secure setup and confirm active state.
4. Configure a trusted identity resolver before Session creation when provider identity must map
   to application user, tenant, workspace, epoch, or grant.
5. Configure media, response segmentation, active-run coordination, and optional server-side
   client tools according to provider capabilities.
6. Test inbound verification, duplicate delivery, attachment handling, routing, model execution,
   outbound delivery, and retry behavior end to end.
7. Treat provider acceptance, delivery, and read receipt as distinct states.

## Invariants

- Preserve the untouched request for official adapter verification.
- Resolve an opaque route key to exactly one installation before parsing provider identity.
- Production state must be shared and atomic across replicas for dedupe, queueing, and locks.
- The trusted resolver runs before Session, Memory, model, or tool execution and fails closed.
- Channel and Route tool policies can only narrow agent permissions.
- Provider events are acknowledged promptly; long execution is coordinated outside webhook life.
- Media bytes are fetched lazily with scoped credentials and subject to explicit limits.

## References

- [references/architecture.md](references/architecture.md)
- [references/provisioning.md](references/provisioning.md)
- [references/conversation-and-media.md](references/conversation-and-media.md)
- [references/trusted-identity-and-tools.md](references/trusted-identity-and-tools.md)
- [references/whatsapp.md](references/whatsapp.md)
- [references/operations-and-testing.md](references/operations-and-testing.md)
- [references/contract-version.md](references/contract-version.md)
