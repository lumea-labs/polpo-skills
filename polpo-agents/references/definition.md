# Agent Definition

An agent lives in `.polpo/agents/<agent-name>/`:

```text
.polpo/agents/support/
|-- agent.json
`-- instructions.md
```

The directory gives the agent its `name`, and `instructions.md` becomes its system prompt, so
`agent.json` must not contain `name`, `systemPrompt`, or `createdAt`.

```json
{
  "role": "Resolve customer questions",
  "model": { "profile": "support" },
  "allowedModelProfiles": ["support", "support-pro"],
  "reasoning": "medium",
  "allowedTools": ["http_fetch", "search_*"],
  "toolLoading": { "mode": "auto" },
  "skills": ["support-playbook"],
  "hooks": ["guardrails"],
  "steering": { "acceptance": "best_effort" },
  "assignedLoops": ["resolve-ticket"],
  "maxTurns": 40,
  "chat": {
    "allowUserQuestions": true,
    "suggestions": { "enabled": true, "maxItems": 3 }
  }
}
```

## Fields

| Field | Meaning |
|---|---|
| `role` | One-line job description shown to the model and in the dashboard. |
| `identity` | Persona: `displayName`, `title`, `company`, `email`, `bio`, `timezone`. Use only when the agent should present as a person. |
| `reportsTo` | Another agent's name, for hierarchy in teams. |
| `team` | Team name when the agent is not in the default team. |
| `model` | Concrete ID (`"openai/gpt-5"`), profile reference (`{ "profile": "x" }`), or primary plus fallbacks. |
| `allowedModelProfiles`, `modelRouting` | Which profiles the agent may use and whether the router picks one. See [models-and-routing.md](models-and-routing.md). |
| `reasoning` | `off`, `minimal`, `low`, `medium`, `high`, or `xhigh`, for models that support it. |
| `allowedTools` | The tool ceiling. Wildcards such as `search_*` are allowed. |
| `toolLoading.mode` | `auto`, `direct`, or `progressive`. |
| `chat` | `allowedTools` for direct chat, `allowUserQuestions` (default true), `suggestions`. |
| `channels.allowedTools` | Narrower tool set for messaging Channel turns. |
| `skills`, `mcpServers` | Installed runtime skills and MCP server configurations. |
| `hooks` | Runtime hook pack names from `.polpo/hooks/` (audit, tool policy, final checks). Each pack once. |
| `steering` | Whether messages sent to a running agent are taken: `acceptance` `best_effort` (default), `accept`, or `reject`, plus optional localized `outcomes`. |
| `assignedLoops`, `executionRouter` | Project Loops the agent may run, and whether a router picks direct or Loop execution. |
| `allowedPaths` | Directories file tools and `bash` may use (absolute or relative to the work dir). Default: the work dir. |
| `sandbox` | Default sandbox isolation, lifecycle, and volumes. See [sandbox.md](sandbox.md). |
| `maxTurns`, `maxConcurrency` | Turn limit per run (default 150) and concurrent tasks (default unlimited). |
| `emailAllowedDomains` | Recipient domains `email_send` may send to. Omitted means any domain. |

`maxTurns` and `maxConcurrency` are safety limits. They do not replace a Loop when the work needs
a fixed sequence of steps.

## Suggestions

`chat.suggestions` enables "suggested next message" chips after an answer. `maxItems` is 2–5
(default 3). Clients must also opt in; see `polpo-runtime` and `polpo-react`.

## Teams

Set `team` in `agent.json` to put the agent in a non-default team. `.polpo/teams/<team>.json`
holds the team's own metadata; membership always comes from the agents' `team` fields.
