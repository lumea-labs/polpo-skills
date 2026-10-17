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

Without a `terminationGate`, `turn:stop` keeps the legacy single tool-free feedback recovery.
For deterministic validation and same-agent repair with tools, use the explicit gate below.

## Termination gate: validate and repair in the same agent

Requires OSS `0.18.18` or later and enabled Cloud capabilities. This opt-in extends
`turn:stop`; ordinary stop hooks keep their existing behavior.
Configure a deterministic validator and explicit cumulative limits:

```json
{
  "version": 1,
  "name": "quality",
  "hooks": [{
    "id": "site-ready",
    "event": "turn:stop",
    "matcher": { "steps": ["implement"] },
    "terminationGate": { "maxCycles": 3, "maxDurationMs": 300000, "maxTokens": 60000 },
    "onFailure": "block",
    "handler": { "type": "tool", "tool": "site_validate", "timeoutMs": 60000 }
  }]
}
```

The validator returns one of these results:

```json
{ "decision": { "action": "continue", "feedback": { "valid": false, "failures": [{ "phase": "build", "file": "src/app.ts", "diagnostic": "Missing import" }] } } }
```

```json
{ "decision": { "action": "allow" } }
```

`continue` reopens the operational phase of the **same invocation**, with its authorized
tools, history, sandbox and working copy. Diagnostics are model-visible JSON; the candidate
is available at `hook.data.candidate`, alongside `terminationAttempt` and `correctionCycle`.
The rejected final response is buffered, then replaced by the validated result. Structured
output still uses the separate tool-free formatting phase; validation can return the agent
to work before a new final output is produced. Tool/progress events remain observable.
Remove the `steps` matcher to apply the pack to chat as well as Loop nodes. Validators use
the same authorized tool executor; include the validation tool in the applicable tool policy.

`maxCycles` is the number of allowed repairs (1–20); `maxDurationMs` is elapsed time from
invocation start (at most one hour); `maxTokens` bounds reported agent/compaction tokens
(at most 10 million). Agent maxTurns is an additional cumulative limit. Multiple matching
gates use the strictest limits. Budgets survive checkpoints and cannot be loosened by
resuming. Input tokens already processed by a provider cannot be preempted; the next output
is capped and over-budget usage stops execution. Nested tool/model costs are separate.
Validators themselves must be deterministic `command`, `http`, `tool` or `mcp_tool`
handlers, bounded by timeout. Prompt/verifier-agent hooks remain available outside a gate.

Empty output, missing decisions, invalid feedback, timeouts and checkpoint-write failures
**fail closed**, even if `onFailure` says continue. `stop` with non-empty string feedback
is a compatibility form of `continue` inside a gate. `continue` outside a configured gate
is rejected. Diagnostics remain subject to the hook contract's redaction and size limits.

Durable Run chat and sequential Project Loop nodes persist history, cumulative budgets,
step-invocation identity and pending/accepted validation together. A recorded validation
decision is replayed without rerunning its handler. An accepted checkpoint returns its
stored result without inference or rebilling previous usage. An interruption during a
model/tool operation is marked `termination_gate_effect_unconfirmed`: it requires
reconciliation and never blindly repeats the operation. Validators must honor their
idempotency key because an external effect can precede its ledger write.

Direct HTTP chat supports continuation during the request, but has no crash-resume promise.
Parallel graph branches do not yet have individual durable checkpoints: a durable gate in
such a branch is rejected before inference. Client-tool handoff remains a handoff and does
not count as successful termination. Existing public Project Loop approval-resume rules
remain unchanged; this feature does not introduce a new retry endpoint.

Errors use `termination_gate_*` codes, including `cycles_exhausted`, `turns_exhausted`,
`time_exhausted`, `tokens_exhausted`, `usage_unknown`, `checkpoint_invalid`,
`checkpoint_too_large`, `effect_unconfirmed`, `parallel_unsupported` and `rejected`.
Traces distinguish validating, continuing and accepted, with stable hook execution IDs.

In Cloud, `runtime.termination-gate.mode` and `runtime.hooks.mode` must both enforce for
the target project/environment. Default gate rollout is off. A configured gate whose rollout
or handler is disabled blocks execution instead of silently removing validation.
Inspect `polpo hooks capabilities --json`: portable `terminationGate` states contract
support; `managed.terminationGate.enabled` states availability on the target.
Author packs under `.polpo/hooks`, run `polpo hooks validate`, then deploy normally.
