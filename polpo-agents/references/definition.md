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
- `assignedLoops` limits Project Loops the agent may execute.
- `executionRouter` optionally chooses direct execution or an assigned Loop.
- `sandbox` defines default isolation, release lifecycle, and allowed named volumes.

Use `maxTurns` and `maxConcurrency` as operational limits, not as substitutes for deterministic
Loop boundaries or host concurrency controls.

## Teams

Set `team` in `agent.json` when the agent belongs to a non-default team. The team file contains
team metadata; membership is derived from agent definitions.
