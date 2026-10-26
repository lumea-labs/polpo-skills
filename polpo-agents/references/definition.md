# Agent Definition

An agent lives in `.polpo/agents/<agent-name>/`:

```text
.polpo/agents/support/
|-- agent.json
`-- instructions.md
```

The directory supplies `name`. `instructions.md` materializes as `systemPrompt`. Runtime
timestamps are not authored. Therefore `agent.json` must not contain `name`, `systemPrompt`, or
`createdAt`.

```json
{
  "role": "Resolve customer questions",
  "model": { "profile": "support" },
  "allowedModelProfiles": ["support", "support-pro"],
  "allowedTools": ["http_fetch", "search_*"],
  "toolLoading": { "mode": "auto" },
  "skills": ["support-playbook"],
  "hooks": ["quality"],
  "steering": { "acceptance": "best_effort" },
  "assignedLoops": ["resolve-ticket"],
  "maxTurns": 40,
  "chat": {
    "allowUserQuestions": true,
    "suggestions": { "enabled": true, "maxItems": 3 }
  }
}
```

## Important Fields

- `role`, `identity`, and `instructions.md` define behavior and communication.
- `model` accepts a concrete ID, a profile reference, or primary plus fallbacks.
- `allowedTools` is the global tool ceiling.
- `toolLoading.mode` is `auto`, `direct`, or `progressive`.
- `chat.allowedTools` and `channels.allowedTools` narrow tool exposure by conversational mode.
- `skills` and `mcpServers` attach reusable capabilities.
- `hooks` attaches trusted project runtime hook packs by name.
- `steering.acceptance` is `accept`, `reject`, or `best_effort`; optional
  `outcomes.rejected` and `outcomes.too_late` define localized `reply | return` responses.
- `assignedLoops` limits Project Loops the agent may execute.
- `executionRouter` optionally chooses direct execution or an assigned Loop.
- `sandbox` defines default isolation, release lifecycle, and allowed named volumes.

Use `maxTurns` and `maxConcurrency` as operational limits, not as substitutes for deterministic
Loop boundaries or host concurrency controls.

Project Loop agent nodes may set their own `steering` policy. Resolution is node, Loop, agent,
trusted project setting, then platform default. Use node-level `reject` for phases where changing
instructions would violate the graph contract. Use `accept` only when the current node can reserve
another model turn; otherwise prefer the default `best_effort` and let the receipt report a late
arrival.

## Teams

Set `team` in `agent.json` when the agent belongs to a non-default team. The team file contains
team metadata; membership is derived from agent definitions.

## Automatic Session titles

`agent.json` accepts `sessionTitles: { enabled, model, language, maxLength, maxOutputTokens, timeoutMs }`. Each field inherits independently from project/host defaults; null clears an override and false disables naming. Without an explicit model, naming uses the concrete first-turn conversational model. Local defaults live in `.polpo/project.json` under `settings.sessionTitles`; managed defaults use the project/environment settings API under `runtime.sessionTitles`. Agent settings survive deploy/pull.

Naming starts asynchronously after the first persisted user message, even a greeting. It is a separate tool-free call, without agent instructions/history/memory/reasoning/sandbox. Defaults: enabled, auto language, 80 characters, 128 output tokens, 5s; hard caps 200/512/15s and at most two attempts within 60s. Manual/imported/existing titles are protected. Do not implement naming by adding a chat tool or a Loop step.
