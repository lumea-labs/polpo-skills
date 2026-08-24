# Context Trust And Guardrails

## Prompt Context Trust

Keep source and trust metadata attached to retrieved content and tool results until the final
prompt boundary. Mark external content as data, bound it, escape nested delimiters, and protect
tool-result messages before they re-enter provider history. Persist the protected representation
in checkpoints while retaining the original separately for authorized UI/audit use.

`settings.contextTrust: "enforce"` is project/host configuration. Request metadata must not
enable or weaken it.

## Guardrail Packs

Guardrails are disabled when project settings omit them. Current packs are:

- `standard`: secret redaction, tool argument validation, private-network blocking, and approval
  for destructive operations;
- `strict`: additionally blocks destructive/policy failures and buffers streaming output for
  enforce-before-delivery;
- `custom`: standard baseline plus bounded literal content rules.

Apply the ordered engine to input, retrieved context, model preflight, local tool input/output,
and final output. The tool middleware evaluates actual arguments, invokes the tool at most once,
bounds the result, and evaluates it before model reinjection.

User-authored regular expressions and private classifier prompts do not belong in serializable
project settings. Hosts may inject process-local policies and credentials through private
adapters.

## Request Override

A request may ask for stricter enforcement only. It cannot enable an absent project policy,
weaken the selected pack, replace custom policy, or bypass host hooks.

Provider-executed and client-side tools execute outside local middleware and need equivalent
provider/client enforcement. Private-network policy must also be enforced at network egress after
DNS resolution to prevent rebinding.

Record bounded secret-free decisions in Run trace/audit. Do not persist prompts, raw tool
arguments/results, schemas, credentials, or private policy text merely to explain a decision.
