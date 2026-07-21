# Agent Configuration

## What is an agent

An agent in Polpo is a reusable, autonomous entity defined in `.polpo/agents.json`. Unlike a single LLM call:

- **Reusable** — defined once, invoked many times across tasks and chat completions
- **Stateful** — has identity, system prompt, per-agent memory, and connection-backed credentials when configured
- **Tool-equipped** — bound to a specific set of tools (`allowedTools`)
- **Hierarchical** — can `reportsTo` another agent for escalation
- **Sandboxed** — restricted to `allowedPaths`, `emailAllowedDomains`, etc.

Agents are the executors. Tasks/missions define what to do; agents are who does it.

## Minimal valid agent

```json
{
  "name": "assistant",
  "model": "xai/grok-4.1-fast-non-reasoning"
}
```

Only `name` is strictly required (per `AddAgentSchema`). Without `model`, the global default is used. Without `allowedTools`, only core tools are loaded (read/write/edit/bash/glob/grep/ls + http_fetch/http_download, plus legacy vault tools when a vault exists).

## Full-featured agent

```json
{
  "name": "researcher",
  "role": "Senior research analyst",
  "model": "anthropic/claude-sonnet-4-5",
  "systemPrompt": "You are Alice, a meticulous researcher. Always cite sources with URL + date accessed.",
  "allowedTools": [
    "read", "write", "edit", "bash", "glob", "grep", "ls",
    "http_*", "search_*", "browser_*", "pdf_*", "excel_*", "memory_*"
  ],
  "allowedPaths": ["/home/researcher/projects", "/tmp/workspace"],
  "identity": {
    "displayName": "Alice Chen",
    "title": "Research Lead",
    "timezone": "Europe/Rome",
    "tone": "Concise, technical, source-cited"
  },
  "reportsTo": "head-of-research",
  "skills": ["research-citation"],
  "maxTurns": 50,
  "maxConcurrency": 3,
  "reasoning": "medium",
  "browserProfile": "researcher-profile",
  "emailAllowedDomains": ["acme.com"],
  "image_model": "fal/fal-ai/flux/dev",
  "vision_model": "openai/gpt-4o-mini",
  "transcribe_model": "openai/whisper-1",
  "tts_model": "openai/tts-1",
  "video_model": "fal/luma-ray-2-flash",
  "search_provider": "exa",
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "http://localhost:8000",
      "headers": { "Authorization": "Bearer ${vault:notion:key}" }
    }
  }
}
```

## Field reference

Every field accepted by `AddAgentSchema` / `UpdateAgentSchema` and persisted on `AgentConfig`:

### Identity
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | string | yes | — | Unique across all teams. Used as the agent's identifier in the API. |
| `role` | string | no | — | Human-readable job title. |
| `identity` | AgentIdentity | no | — | Persona object (see below). |
| `systemPrompt` | string | no | — | Custom prompt appended to the agent's base system prompt. |
| `reportsTo` | string | no | — | Name of the agent this one escalates to. |
| `version`, `author`, `tags` | string / string[] | no | — | Registry metadata for skill packs. |

### Model + reasoning
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `model` | string | no | global default | Format `provider/model` (e.g. `anthropic/claude-sonnet-4-5`, `xai/grok-4.1-fast-non-reasoning`, `openai/gpt-4o`). Routed by the configured model runtime/gateway. |
| `reasoning` | ReasoningLevel | no | global setting | `off` / `minimal` / `low` / `medium` / `high` / `xhigh`. Higher = deeper thinking, slower + more expensive. |
| `maxTurns` | number | no | 150 | Cap on conversation turns to prevent infinite loops. |
| `maxConcurrency` | number | no | unlimited | Max concurrent tasks this agent can hold. |

### Per-modality models (override per agent)
Each tool category has a default. Override per-agent if needed:

| Field | Tool driven | Typical default |
|---|---|---|
| `image_model` | `image_generate` | `fal/fal-ai/flux/dev` |
| `video_model` | `video_generate` | `fal/luma-ray-2-flash` |
| `vision_model` | `image_analyze` | `openai/gpt-4o-mini` |
| `transcribe_model` | `audio_transcribe` | `openai/whisper-1` |
| `tts_model` | `audio_speak` | `openai/tts-1` (also `edge/edge-tts` for free local voices) |
| `search_provider` | `search_*` | `exa` |

### Tools + sandbox
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `allowedTools` | string[] | no | core only | Tool names or wildcards (e.g. `["read","write","browser_*","memory_*"]`). `"*"` enables everything. See `tools.md`. |
| `allowedPaths` | string[] | no | `[workDir]` | Filesystem sandbox for read/write/edit/bash. |
| `browserProfile` | string | no | agent name | Persistent browser profile dir (cookies, localStorage). Used by `browser_*` tools. |
| `emailAllowedDomains` | string[] | no | all | Recipient allowlist for `email_send`. Without it, the agent can send anywhere. |

### Mission-tied (volatile) agents
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `volatile` | boolean | no | false | If true, agent auto-removed when its mission completes. |
| `missionGroup` | string | no | — | Mission group this volatile agent belongs to. Required if `volatile: true`. |

### Skills + external tools
| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `skills` | string[] | no | — | Names of installed skills to attach. Their SKILL.md content is injected into the agent's system prompt. |
| `mcpServers` | object | no | — | Map of MCP server connections (stdio/sse/http). Tools namespaced as `mcp__<server>__<tool>`. |

### Timestamps + admin
| Field | Type | Notes |
|---|---|---|
| `createdAt` | ISO string | Server-set. |

## AgentIdentity sub-shape

```typescript
interface AgentIdentity {
  displayName?: string;          // "Alice Chen"
  title?: string;                // "Senior Research Analyst"
  company?: string;              // "Acme Corp"
  email?: string;                // primary email (default From: for email_send)
  bio?: string;                  // short persona description
  timezone?: string;             // IANA tz (e.g. "Europe/Rome")
  avatar?: string;               // path under .polpo/avatars/
  responsibilities?: (string | {
    area: string;
    description: string;
    priority?: "critical" | "high" | "medium" | "low";
  })[];
  tone?: string;                 // "Concise, data-driven"
  personality?: string;          // "Detail-oriented, source-cited"
  socials?: Record<string, string>; // { x: "@alice", github: "alice" }
}
```

When to use: rich identity for human-facing agents (support, sales). Skip for purely backend agents.

## Reasoning levels

| Level | Cost | Speed | Use for |
|---|---|---|---|
| `off` | baseline | fast | Simple lookups, data extraction |
| `minimal` | +5% | fast | Lightweight reasoning |
| `low` | +10% | normal | QA, basic analysis |
| `medium` | +20% | normal | Code generation, multi-step research |
| `high` | +30% | slow | Complex reasoning, hard debugging |
| `xhigh` | +40% | slowest | Frontier-grade problems |

## MCP servers

Connect external Model Context Protocol servers to extend an agent's tools at runtime:

```json
{
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "http://localhost:8000",
      "headers": { "Authorization": "Bearer ${vault:notion:key}" }
    },
    "files": {
      "type": "sse",
      "url": "http://localhost:3001/events"
    },
    "local-tool": {
      "type": "stdio",
      "command": "/usr/local/bin/my-tool",
      "args": ["--config", "/etc/my-tool.conf"],
      "env": { "MY_VAR": "value" }
    }
  }
}
```

- Tools from MCP server `notion` exposing `query_database` → tool name `mcp__notion__query_database`.
- Use dashboard/Connections for remote MCP when available, so credentials and tool grants stay server-side.
- Use `mcpServers` for code-configured MCP endpoints and local/server-controlled tools.
- `${vault:<service>:<key>}` interpolation is still supported for legacy vault-backed headers/env.

## Volatile agents (mission-scoped)

For ephemeral agents that live only for one mission run:

```json
{
  "name": "worker-batch-3",
  "model": "anthropic/claude-haiku-4-5",
  "volatile": true,
  "missionGroup": "batch-processing",
  "allowedTools": ["read", "write"],
  "maxTurns": 5
}
```

Lifecycle:
1. Created when its mission starts
2. Added to the mission team automatically
3. Removed when the mission completes (or fails)

Useful for fan-out workflows where you want N parallel ephemeral workers.

## Practical examples

### Minimal chat agent
```json
{
  "name": "assistant",
  "model": "xai/grok-4.1-fast-non-reasoning",
  "systemPrompt": "You are a helpful assistant. Be concise."
}
```

### Research agent
```json
{
  "name": "researcher",
  "role": "Research analyst",
  "model": "anthropic/claude-sonnet-4-5",
  "systemPrompt": "Cite every external claim with URL + date. Contrast sources, don't just list them.",
  "allowedTools": ["read","write","search_*","browser_*","pdf_*","http_*","memory_*"],
  "skills": ["research-citation"],
  "vision_model": "openai/gpt-4o-mini",
  "reasoning": "medium"
}
```

### Code-writing agent
```json
{
  "name": "engineer",
  "role": "Backend engineer",
  "model": "anthropic/claude-opus-4-7",
  "systemPrompt": "Write clean TypeScript. Prefer simple over clever. Every feature ships with tests.",
  "allowedTools": ["read","write","edit","bash","glob","grep","ls","http_fetch"],
  "allowedPaths": ["/home/dev/my-project", "/tmp/sandbox"],
  "maxTurns": 100,
  "reasoning": "high"
}
```

### Volatile worker
```json
{
  "name": "worker",
  "model": "anthropic/claude-haiku-4-5",
  "allowedTools": ["read","write"],
  "volatile": true,
  "missionGroup": "bulk-processing",
  "maxTurns": 5
}
```

## Common pitfalls

- **Empty wildcard** (`"browser_"` with no suffix) — not a wildcard. Use `"browser_*"` or specific tool names.
- **No model anywhere** (agent has no `model`, no global default set) — task spawn fails with "no model configured".
- **`allowedPaths: ["/"]`** — sandbox escape. Always be specific.
- **Credential reference without entry** — an MCP header or tool expects a Connection/vault key that does not exist. Configure it first.
- **Circular `reportsTo`** — A → B → A. Escalation chains must be acyclic.
- **`*` allowedTools on an untrusted agent** — Principle of least privilege; whitelist only what's needed.
- **Volatile without `missionGroup`** — volatile agents must declare their group; otherwise cleanup misses them.
