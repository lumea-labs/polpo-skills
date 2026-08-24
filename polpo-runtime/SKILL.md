---
name: polpo-runtime
description: Integrate and operate the Polpo runtime through OpenAI-compatible completions and the Polpo SDK. Use for Sessions, durable runs and SSE reconnect, Project Loops, tasks and missions, client-side tools, structured output, parallel tools, chat interactions, steering, schedules, runtime plans, or execution debugging.
---

# Polpo Runtime

Keep execution lifetime, canonical conversation state, and the client transport distinct. A
Session stores conversation history; a Run records one execution; a Project Loop is one possible
execution mode; SSE is only a delivery transport.

## Workflow

1. Identify the surface and invocation source: direct chat, Channel, task, schedule, or Loop.
2. Preserve `x-session-id` when continuity is required. Do not rebuild canonical history from
   client guesses when a continuation API is available.
3. Use durable delivery for work that must survive disconnects. Reconnect to the Run event log;
   never repeat the creation request.
4. Use direct chat for conversational turns and Project Loops for deterministic multi-step work.
5. Validate response schemas, tool calls, tool results, and Loop bindings before they reach a
   provider or persisted history.
6. Use idempotency keys for continuation, schedule triggers, and externally visible actions.
7. Inspect terminal events and persisted state, not only the last SSE chunk, before declaring a
   run successful.

## Invariants

- Every assistant tool call persisted into model history has exactly one valid result before a
  later model turn. Malformed calls are rejected or repaired at the runtime boundary.
- Request-scoped client tools are returned to the client and never executed by Polpo.
- Explicit Project Loop continuation preserves Session, trusted invocation context, and
  idempotency while recalculating Loop tool policy.
- `fresh` sandbox isolation means one fresh lease for the outer run, shared by root tools and
  nested Loop agent steps.
- Steering is accepted only at safe boundaries and never interrupts a tool midway.
- Provider errors must become stable Polpo errors with the useful diagnostic preserved.

## References

- [references/completions-and-sessions.md](references/completions-and-sessions.md)
- [references/durable-runs.md](references/durable-runs.md)
- [references/project-loops.md](references/project-loops.md)
- [references/client-tools-and-interactions.md](references/client-tools-and-interactions.md)
- [references/structured-and-parallel.md](references/structured-and-parallel.md)
- [references/steering-and-runtime-plans.md](references/steering-and-runtime-plans.md)
- [references/context-trust-and-guardrails.md](references/context-trust-and-guardrails.md)
- [references/tasks-and-missions.md](references/tasks-and-missions.md)
- [references/schedules.md](references/schedules.md)
- [references/contract-version.md](references/contract-version.md)
