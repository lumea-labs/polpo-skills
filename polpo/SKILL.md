---
name: polpo
description: "Build production AI agents with Polpo: create or link cloud projects, install coding-agent skills, configure .polpo/ agents, integrate Polpo into an existing app, deploy agents, wire chat completions, custom tools, MCP, Connections, memory, tasks, missions, schedules, model gateway/BYOK, and debug the Polpo CLI/API. Use for polpo, .polpo/, polpo.json, agents.json, polpo create, polpo link, polpo deploy, agent tools, custom tools, MCP, Connections, vault, tasks, missions, schedules, model gateway, or any Polpo integration work."
---

# Polpo

Polpo is the backend/runtime for production AI agents. Agents are defined in `.polpo/`, deployed to the cloud by the CLI, and called through an OpenAI-compatible API.

Never invent Polpo flows. Prefer the CLI and this skill over web search. Read the referenced files only when you need field-level details.

## Default Setup Workflow

When a user asks to set up Polpo from a coding agent, make the path as frictionless as possible.

1. Inspect the current repo: `pwd`, `ls`, `git remote -v`, `package.json`, existing `.polpo/polpo.json`, and `.env.local`.
2. If `.polpo/polpo.json` exists, treat the project as already linked. Read it, verify `.env.local`, then integrate or modify agents.
3. If the user provided a project id, run:
   ```bash
   npx @polpo-ai/cli link --project-id <uuid> -y
   ```
4. If the repo is not linked, infer a project name from `package.json`, the git repo, or the folder name, then run:
   ```bash
   npx @polpo-ai/cli create --name "<project-name>" --template empty --scenario none --skills global --install-cli yes -y
   ```
5. Do not ask the user to choose a name, template, or scenario unless the repo is ambiguous or the user asked for a specific starter app. For existing codebases, use `--template empty`; it adds `.polpo/` to the current repo instead of generating an unrelated app.
6. If the CLI opens a browser for signin/signup, wait for the user to authorize it. Fresh signup is part of the same device-code flow: the browser opens `/cli-auth`, the user signs up or signs in, and the CLI receives credentials automatically.
7. After setup, verify `.polpo/polpo.json`, `.polpo/agents.json`, and `.env.local`. `polpo create` also deploys the scaffolded agent, so the project should be live unless the CLI reported a deploy failure.
8. Continue into the application code. Wire the app to `POLPO_URL` and `POLPO_API_KEY`, add an API route/proxy if the app must hide the key, and call `POST $POLPO_URL/v1/chat/completions` or use `@polpo-ai/react` for UI.
9. Ask the user only for blocking decisions: multiple organizations/projects, browser auth/captcha, a specific existing project to link, or a product decision that cannot be inferred.

The goal is not just to create `.polpo/`; the goal is a working integration in the current codebase.

## Project Filesystem

Every Polpo-enabled repo has a `.polpo/` directory.

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
│   ├── tools/                  # Custom tool functions
│   │   └── <tool-name>.ts      # export default defineTool({...})
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
Browser-based device-code auth. Usually you do not need to run this separately because `create`, `link`, `install`, `deploy`, and cloud commands call the same login flow when credentials are missing.

```bash
polpo login
```

### `polpo create`
Create a cloud project, scaffold local `.polpo/`, generate a project-scoped API key, write `.env.local`, install coding-agent skills, install the CLI globally when requested, and deploy the first agent.

```bash
polpo create
npx @polpo-ai/cli create --name my-app --template empty --scenario none --skills global --install-cli yes -y
```

Templates: `empty`, `chat`, `chat-widget`, `multi-agent`. Use `empty` for an existing app/repo. Use UI templates only when the user explicitly wants a new starter app.

### `polpo link`
Attach an existing directory to an existing cloud project. Pulls current agents/teams/memory down.

```bash
polpo link --project-id <uuid>
npx @polpo-ai/cli link --project-id <uuid> -y
```

### `polpo install`
Install coding-agent skills (Cursor, Claude Code, Windsurf, Codex, etc.) without scaffolding a project.

```bash
polpo install -i                       # interactive picker
polpo install --client claude-code     # specific client
polpo install --client cursor,codex    # multiple clients
polpo install --scope global           # global install
polpo install --scope project --dir .  # project-local install
```

### `polpo deploy`
Sync local `.polpo/` to the cloud. Default scope includes agents, teams, memory, vault compatibility data, missions, loops, playbooks, schedules, skills, custom tools, and avatars. Tasks and sessions are opt-in.

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
4. **Connections and credentials**: Connections resolve external account credentials server-side. Vault remains supported for legacy/file-based credentials and MCP interpolation.
5. **Model routing**: `agent.model` resolves through the configured model runtime/gateway (for example `xai/grok-4.1-fast-non-reasoning`, `anthropic/claude-sonnet-4-5`, `openai/gpt-4o`).
6. **Sandboxed execution**: tools run inside an isolated sandbox; agent output flows back as SSE.

## Integrating Polpo Into App Code

After `create` or `link`, use the generated `.env.local`:

```bash
POLPO_URL=https://<project-slug>.polpo.cloud
POLPO_API_KEY=sk_live_...
```

### Backend/server call
Keep `POLPO_API_KEY` server-side when the app has a backend.

```ts
const res = await fetch(`${process.env.POLPO_URL}/v1/chat/completions`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.POLPO_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    agent: "agent-1",
    stream: true,
    messages: [{ role: "user", content: "Hello" }],
  }),
});
```

### React UI
For React chat interfaces, use the `polpo-react` skill. Pass the project endpoint as the root URL, not a path with `/v1` appended.

```tsx
import { PolpoProvider } from "@polpo-ai/react";

<PolpoProvider
  baseUrl={process.env.NEXT_PUBLIC_POLPO_URL!}
  apiKey={process.env.NEXT_PUBLIC_POLPO_API_KEY}
  autoConnect={false}
>
  {children}
</PolpoProvider>
```

If the frontend would expose a secret key, add a server route/proxy and keep `POLPO_API_KEY` out of the browser.

## Where to look next

- **Agent config** (`references/agent-config.md`): every `AgentConfig` field, with examples.
- **Tools** (`references/tools.md`): full catalog + wildcard patterns.
- **Connections** (`references/connections.md`): API keys, OAuth connectors, MCP URL connections, and credential resolution.
- **Tasks & missions** (`references/tasks-missions.md`): task lifecycle, mission documents, atomic edits.
- **Memory** (`references/memory.md`): shared + per-agent memory layout.
- **Teams** (`references/teams.md`): teams.json shape + management endpoints.
- **Vault** (`references/vault.md`): legacy encrypted credential file and compatibility behavior.
- **Patterns** (`references/patterns.md`): 6 worked multi-agent architectures.
- **API endpoints** (`references/api-endpoints.md`): full REST surface with curl examples.
- **Public docs**: `https://docs.polpo.sh` — crawl `/docs/`, `/api-reference/` first.
