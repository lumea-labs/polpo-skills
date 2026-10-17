---
name: polpo-channels
description: Put a Polpo agent on WhatsApp, Telegram, Slack, or Discord, and operate those messaging Channels. Covers `polpo channels` provisioning, Connections for provider credentials, Routes from a Channel to an agent, webhook verification, WhatsApp templates and the 24-hour window, media and voice messages, bursts of short messages, mapping a phone number or Slack user to your app's user (identity resolver), Channel tool restrictions, reply buttons and lists, and self-hosting `@polpo-ai/channels`. Use this whenever the user wants an agent reachable from a chat app, asks why messages are not answered or arrive twice, or needs proactive messages, even if they just say "connect the bot to WhatsApp".
---

# Polpo Channels

A Channel connects an agent to a messaging provider. Four resources are involved:

- **Connection**: the provider credentials (for WhatsApp: access token, app secret, verify token).
- **Channel**: one installed destination, such as one WhatsApp phone number or one Slack app.
- **Route**: which agent answers on that Channel, optionally with fewer tools.
- **Setup**: a temporary record while the provider confirms the installation.

## Choose Your Path

- **Polpo Cloud**: provision with the CLI or dashboard. Polpo hosts the webhook, verifies
  signatures, keeps shared state across replicas, and stores credentials. Follow the workflow
  below and [references/provisioning.md](references/provisioning.md).
- **Self-hosted**: embed `@polpo-ai/channels` in your runtime and supply credentials, shared
  state, and webhook routing yourself. Read
  [references/self-hosted-channels.md](references/self-hosted-channels.md) first.

## Workflow (Cloud)

1. Check what exists: `polpo channels providers`, `polpo channels list`,
   `polpo connections list`.
2. Create a Connection holding the provider credentials (never pass secrets as CLI arguments or
   put them in `.polpo/`).
3. `polpo channels add <provider> --agent <agent> --connection <connection-id> ...`. Use
   `--allowed-tool` to give the Channel fewer tools than the agent has.
4. Finish provider verification. The command prints a callback URL and next action; the Channel
   becomes active only after the provider confirms it. Check with `polpo channels setup-status`.
5. If the agent must know who is writing (your app's user, tenant, plan), configure an identity
   resolver before going live ([references/trusted-identity-and-tools.md](references/trusted-identity-and-tools.md)).
6. Test with real messages: text, a reply, an image, a voice note, several quick messages, and a
   duplicate delivery. `polpo channels test <channel-id> --to <recipient>` sends a test message.

## Things That Surprise People

- A Channel shows `setup_required` or `pending_external` until the provider verifies it.
  Updating its status by hand is refused; finish the provider step instead.
- Provider "accepted" is not "delivered" or "read". Do not report delivery from acceptance.
- WhatsApp only allows free-form replies within 24 hours of the user's last message. Outside
  that window use an approved template (`polpo channels send-template`).
- Channel and Route tool lists can only remove tools the agent already has.
- If an identity resolver is configured and it fails, times out, or denies, the message is not
  answered. That is deliberate: no answer is safer than answering as the wrong user.
- Several short messages in a row are grouped into one turn. Messages that arrive while the agent
  is still answering are queued or used to steer the run, depending on Channel settings.

## References

- [references/provisioning.md](references/provisioning.md): `polpo channels` commands.
- [references/whatsapp.md](references/whatsapp.md): WhatsApp Cloud API specifics.
- [references/conversation-and-media.md](references/conversation-and-media.md): media, voice,
  bursts, response splitting.
- [references/trusted-identity-and-tools.md](references/trusted-identity-and-tools.md): identity
  resolver and server-side Channel tools.
- [references/suggestions.md](references/suggestions.md): reply buttons and lists.
- [references/operations-and-testing.md](references/operations-and-testing.md): test checklist
  and monitoring.
- [references/self-hosted-channels.md](references/self-hosted-channels.md): running Channels in
  your own server.
- [references/contract-version.md](references/contract-version.md): checked version and minimums.
