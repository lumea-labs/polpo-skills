# Runtime Hooks

The runtime emits stable lifecycle events across direct chat, Run-backed chat, Channels, and
agent nodes in Project Loops. The v1 contract includes session, input, turn, model, tool,
approval, agent, compaction, model-switch, Loop, sandbox, and Run events.

Every handler receives a versioned, redacted envelope, stable identity, and idempotency key.
Payloads, timeouts, recursion, prompt evaluations, and verifier-agent turns are bounded. Hook
failures follow explicit `onFailure: continue|block` policy.

For `tool:before`, `modify.data.input` becomes the candidate input before the ordinary middleware,
authorization, and schema validation. For `tool:after`, `modify.data.result` replaces only the
normalized model-visible result. Hooks cannot widen static tool policy or bypass approval.

Use `turn:stop` for a final bounded quality check. A feedback response triggers exactly one
tool-free recovery model step; the runtime checks the result again and then terminates. Never
build open-ended agent control flow with this event; use a Project Loop for that.
