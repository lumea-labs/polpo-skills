# Operations And Testing

## Minimum End-To-End Matrix

Before going live, test the real provider flow for each enabled provider:

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

## Debugging

When a message is not answered, follow it through: provider event received and verified,
de-duplicated, grouped into a turn, identity resolved, Session chosen, run created, reply
delivered. Correlate by Channel, Route, provider message ID, Session, and Run IDs, which appear
in Channel events and run logs (`polpo cloud-logs --follow` in Cloud).

## Provider Limits

Query the immutable provider capability matrix before exposing rich cards, actions, streaming,
files, replies, or receipts. Use documented fallback behavior and never pretend an unsupported
capability succeeded.
