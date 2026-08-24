# Operations And Testing

## Minimum End-To-End Matrix

Test the real provider flow for each enabled provider:

1. verification challenge and invalid challenge;
2. valid and invalid signature;
3. duplicate provider event;
4. plain text, reply, image, audio, video, and document;
5. burst of short messages and attachment plus caption;
6. resolver dispatch, consume, denial, timeout, and malformed response;
7. stable Session reuse and scope-version rotation;
8. Route/tool-policy denial before model invocation;
9. outbound reply, segmentation, typing failure, provider 4xx/5xx, and retry;
10. active-run queue or steering across multiple server replicas.

## Observability

Emit safe provider-neutral events for webhook verification, normalization, dedupe, burst/queue,
resolver, Session routing, run creation, media fetch/transcription, delivery, and provider error.
Observability hooks are best-effort and time-bounded; their failure must not fail the turn.

Correlate installation, Channel, Route, provider event, thread, Session, and Run IDs. Redact
credentials, Bearer tokens, app secrets, media bytes, grants, and private resolver output.

## Provider Limits

Query the immutable provider capability matrix before exposing rich cards, actions, streaming,
files, replies, or receipts. Use documented fallback behavior and never pretend an unsupported
capability succeeded.
