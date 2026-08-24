# Channel Architecture

`@polpo-ai/channels` owns transport behavior:

- webhook challenge/signature verification;
- provider event normalization and deduplication;
- typing indicators, replies, response delivery, and provider limits;
- attachment discovery and authenticated lazy fetch;
- local burst/debounce/queue coordination;
- provider-neutral transport events and capability inspection.

The host owns credentials, durable state, agent routing, canonical Sessions, model/tool
execution, billing, rollout, and managed provider automation.

## Installation Resolution

Resolve only an opaque route key from the webhook URL to a scoped installation. Then pass the
untouched request to the official adapter. Do not choose an installation from workspace, team,
chat, phone, or account identifiers read from an unverified payload.

Every installation has a stable ID and credential revision. Increment the revision when
credentials rotate so cached adapters are evicted.

## State

In-memory state is suitable for local development or one process. Production requires a shared
atomic store, normally Redis, for provider-event dedupe, active-turn locks, queueing, debounce,
and subscriptions.

## Conversation Bridge

The Polpo conversation bridge maps normalized turns to one canonical Session per resolved
external user/thread/scope. It loads bounded history and resolves attachments before model input.
Transport history is not the canonical model history.

Active-run coordination may execute, durably queue, steer, or reject an event. A coordinator must
call `execute()` at most once and durably record non-inline dispositions.
