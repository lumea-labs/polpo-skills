# WhatsApp Cloud API

A WhatsApp Connection holds the Meta access token, app secret, and verify token. A Channel
identifies one `phoneNumberId` destination. Credentials remain server-side.

## Activation

Meta must successfully complete the GET callback challenge before the Channel becomes active.
Route both challenge and signed POST events to the same opaque installation route without
rewriting the request. Dashboard, CLI, and API must enforce the same activation gate.

One Meta app/Connection may authorize multiple eligible phone-number destinations. Keep each
destination as a distinct Channel and verify provider ownership/subscription during provisioning.
Reject a real destination conflict before creating partial resources.

## Sending

Inside the customer-service window, normal provider delivery can send conversational responses.
Outside the window, use an approved WhatsApp template through the provider-specific managed API:

```bash
polpo channels send-template CHANNEL_ID \
  --to 15551234567 \
  --name reminder \
  --language it
```

Use an idempotency key for retries and validate template components before provider submission.

The currently pinned Chat SDK adapter may not normalize Meta `statuses` into authoritative
delivered/read/failed events. Treat `delivery.completed` as provider acceptance unless the active
adapter explicitly exposes later receipt states.

## Media

Inbound image, audio, video, and document metadata is normalized. Authenticated media download,
transcription, model compatibility, retention, and response modality are host/runtime concerns.
Test each enabled modality with real provider payloads, not only synthetic webhook JSON.
