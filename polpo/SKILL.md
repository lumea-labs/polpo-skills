---
name: polpo
description: Build production AI agents with Polpo — the open composable backend for agents with integrated sandbox runtime, tasks and workflows, and AI Gateway. Use this skill whenever working with Polpo projects, .polpo/ directories, agent configuration, tools, memory, vault, teams, tasks, missions, skills, deployments, or the Polpo CLI/API. Triggers on "polpo", "agent", ".polpo/", "polpo.json", "agents.json", "polpo deploy", "polpo create", "polpo link", "polpo install", agent tools, agent memory, agent vault, system prompt design, multi-agent architecture, or any mention of Polpo.
---

# Polpo

Open composable backend for AI agents. Agents are defined as config, deployed to isolated sandboxes, and called via an OpenAI-compatible API. Use Polpo when you need multiple specialized agents (PM + engineer + reviewer, or analyst + researcher + writer) to collaborate on real work: feature specs, code, content pipelines, data processing.

Never guess about Polpo internals — use this skill and the reference files. When this skill doesn't cover something, follow the lookup chain at the bottom.

## Project Filesystem

Every Polpo project lives in a `.polpo/` directory.

```
my-project/
├── .polpo/
│   ├── polpo.json              # Project link config (name, slug, projectId)
│   ├── agents.json             # Array of [{ agent: AgentConfig, teamName }]
│   ├── teams.json              # Array of [{ name, description }]
│   ├── memory.md               # Shared project memory — injected into every agent's prompt
│   ├── memory/                 # Per-agent memory files
│   │   └── <agent-name>.md     # Filename MUST match agent.name exactly
│   ├── vault.enc               # Encrypted credentials bundle (AES-256-GCM)
│   ├── skills/                 # Custom skill packs
│   │   └── <skill-name>/
│   │       └── SKILL.md        # YAML frontmatter + markdown body
│   ├── missions/               # Multi-task workflow definitions
│   │   └── <mission-name>.json
│   ├── tasks/                  # Standalone task files (opt-in deploy)
│   │   └── <task-name>.json
│   ├── playbooks/              # Reusable mission templates
│   ├── schedules/              # Cron-scheduled missions
│   └── output/                 # Agent-produced files at runtime
└── .env.local                  # POLPO_API_KEY, POLPO_URL (project-scoped)
```

### polpo.json
```json
{
  "project": "My Project",
  "projectSlug": "k7m2xpg9tn4bqw8e1jrf",
  "projectId": "3d606bce-73a4-49a2-9e6e-72883ecacaa5"
}
```

### agents.json (array of wrapped configs)
```json
[
  {
    "agent": {
      "name": "researcher",
      "role": "Research specialist",
      "model": "xai/grok-4.1-fast-non-reasoning",
      "systemPrompt": "You are a meticulous researcher...",
      "allowedTools": ["read", "write", "search_*", "browser_*", "memory_*"]
    },
    "teamName": "default"
  }
]
```

See `references/agent-config.md` for every available field.

## Core CLI Commands

### `polpo login`
Browser-based device-code auth. Stores credentials locally.

```bash
polpo login
```

### `polpo create`
Interactive wizard: create a cloud project + scaffold local `.polpo/`. Optionally seed example scenarios (data analyst, marketing researcher, product manager).

```bash
polpo create
polpo create --name my-app --template blank --scenario data-analyst -y
```

### `polpo link`
Attach an existing directory to an existing cloud project. Pulls current agents/teams/memory down.

```bash
polpo link --project-id <uuid>
```

### `polpo install`
Install coding-agent skills (Cursor, Claude Code, Windsurf, etc) without scaffolding a project.

```bash
polpo install                          # interactive, auto-detects coding agents
polpo install --client claude-code     # specific agent only
polpo install --scope global           # install globally vs project-local
```

### `polpo deploy`
Sync local `.polpo/` to the cloud. Default scope: agents, teams, memory, vault, missions, playbooks, schedules, skills. Use flags for opt-in resources.

```bash
polpo deploy                       # default scope
polpo deploy --include-tasks       # also push standalone tasks
polpo deploy --include-sessions    # also push chat session history
polpo deploy --all                 # everything
polpo deploy --force               # override conflicts without prompting
polpo deploy -y                    # auto-accept all prompts
```

Behavior: for each resource, CLI fetches existing remote, compares against local, and:
- If new → POST (create)
- If exists and identical → skip
- If differs → PATCH (update) — interactive prompt without `--force`

### `polpo cloud-logs`
Tail the project's logs from the cloud.

```bash
polpo cloud-logs                   # last N entries
polpo cloud-logs --follow          # stream live via SSE
```

### `polpo projects list`
List your projects across organizations.

```bash
polpo projects list
polpo projects list --org <org-id>
```

### `polpo whoami`
Show the current authenticated user + org context.

```bash
polpo whoami
```

## Agent Runtime Model

At deploy time, Polpo registers each agent from `agents.json` on the cloud. When a request arrives:

1. **Agent lookup** by name (not UUID).
2. **System prompt assembly**: base role + custom `systemPrompt` + injected shared memory + tool docs + skill content.
3. **Tool resolution**: `allowedTools` filtered against the canonical catalog (see `references/tools.md`). Wildcards (`browser_*`, `search_*`, `memory_*`) expand to their category. Memory tools (`memory_get`, `memory_save`, `memory_append`, `memory_update`) need a memory store and an agent name to scope access.
4. **Vault binding**: credentials from `.polpo/vault.enc` are decrypted just-in-time and exposed via `vault_get` / `vault_list` tools — agent never sees raw values.
5. **Model routing**: `agent.model` resolves via Vercel AI Gateway (e.g. `xai/grok-4.1-fast-non-reasoning`, `anthropic/claude-sonnet-4-5`, `openai/gpt-4o`).
6. **Sandboxed execution**: tools run inside an isolated sandbox; agent output flows back as SSE.

## Where to look next

- **Agent config** (`references/agent-config.md`): every `AgentConfig` field, with examples.
- **Tools** (`references/tools.md`): full catalog + wildcard patterns.
- **Tasks & missions** (`references/tasks-missions.md`): task lifecycle, mission documents, atomic edits.
- **Memory** (`references/memory.md`): shared + per-agent memory layout.
- **Teams** (`references/teams.md`): teams.json shape + management endpoints.
- **Vault** (`references/vault.md`): encrypted credentials + supported services.
- **Patterns** (`references/patterns.md`): 6 worked multi-agent architectures.
- **API endpoints** (`references/api-endpoints.md`): full REST surface with curl examples.
- **Public docs**: `https://docs.polpo.sh` — crawl `/docs/`, `/api-reference/` first.
