---
name: polpo-agents
description: Design and configure AI agents for Polpo — models, tools, identity, memory, vault, and system prompts. Use when the user wants to create an agent, configure agent capabilities, set up agent memory, manage agent credentials (vault), choose models, assign tools, or architect multi-agent systems. Triggers on "polpo agent", "configure agent", "agent design", "agent tools", "agent memory", "agent vault", "system prompt", "agent identity".
---

# Polpo Agent Design

## Agent Configuration

An agent is defined by its `AgentConfig`. Create via API or dashboard.

```typescript
{
  name: "coder",                              // unique identifier
  role: "Senior Full-Stack Engineer",         // human-readable role description
  model: "xai:grok-4-fast",                  // provider:model format
  allowedTools: ["bash", "read", "write", "edit", "glob", "grep"],
  systemPrompt: "You are a senior engineer. Write clean, tested code.",
  maxTurns: 150,                              // max LLM turns per session
  maxConcurrency: 3,                          // max parallel tasks
  reasoning: "medium",                        // thinking depth
}
```

## Model Selection

Format: `provider:model`. Choose based on task complexity and cost.

| Use Case | Recommended | Why |
|----------|-------------|-----|
| Fast coding tasks | `xai:grok-4-fast` | Fast, capable, good tool use |
| Complex reasoning | `anthropic:claude-sonnet-4-5` | Best reasoning |
| Budget tasks | `xai:grok-3-mini-fast` | Cheap, fast |
| Vision tasks | `openai:gpt-4o` | Strong multimodal |

## Tools

Tools define what an agent can do. Assign only what's needed — principle of least privilege.

### Coding Tools
- `bash` — Execute shell commands
- `read` — Read files
- `write` — Create/overwrite files
- `edit` — Search-and-replace in files
- `glob` — Find files by pattern
- `grep` — Search file contents

### Extended Tools
- `browser_*` — Web browsing (navigate, click, fill forms)
- `email_*` — Send/read emails (requires vault credentials)
- `image_*` — Generate/edit images
- `search_*` — Web search
- `http_fetch` — HTTP requests (always available)
- `vault_get` — Access stored credentials (always available)

## System Prompt

The system prompt defines the agent's behavior. Keep it focused.

```
You are {name}, a {role}.

{Core instructions — what to do, how to do it}

{Constraints — what NOT to do}

{Output format preferences}
```

**Good system prompt:**
```
You are a code reviewer. Review code for bugs, security issues, and performance problems.
Be concise. Flag critical issues first. Suggest fixes with code examples.
Never approve code with SQL injection or XSS vulnerabilities.
```

**Bad system prompt:** Overly long, generic instructions that Claude already knows.

## Identity

For agents that interact with humans (email, chat, social), define an identity:

```typescript
identity: {
  displayName: "Alex",
  title: "Engineering Lead",
  bio: "I help teams ship reliable software.",
  tone: "Direct, technical, no fluff",
  personality: "Pragmatic problem-solver",
  responsibilities: [
    { area: "Code review", description: "Review all PRs", priority: "critical" },
    { area: "Architecture", description: "System design decisions", priority: "high" },
  ],
  socials: { github: "alex-eng", twitter: "@alex_ships" },
}
```

## Memory

Memory persists across sessions. Two levels:

### Project Memory
Shared by all agents. Use for project context, conventions, architecture decisions.

```
# Project Context
- Next.js 15 + TypeScript + Tailwind
- PostgreSQL via Drizzle ORM
- Deploy on Vercel

# Conventions
- Use Vitest for tests
- Prefer server components
- No default exports (except pages)
```

### Agent Memory
Private to one agent. Auto-accumulated as the agent works. Use for agent-specific learnings.

```
# Learned Preferences
- User prefers functional style over classes
- Always run tests before committing
- Use pnpm, not npm
```

Memory is read by the agent at the start of each session. Update via API:
- `PUT /v1/memory` — project memory
- `PUT /v1/memory/agent/{name}` — agent memory

## Vault

Store service credentials that agents access at runtime via the `vault_get` tool.

```typescript
// Store credentials
POST /v1/vault/entries
{
  agent: "emailer",
  service: "gmail",
  type: "smtp",
  credentials: { host: "smtp.gmail.com", port: 587, user: "...", pass: "..." }
}

// Agent uses vault_get("gmail") at runtime — credentials never in system prompt
```

Credential types: `smtp`, `imap`, `oauth`, `api_key`, `login`, `custom`.

## Agent Patterns

See [references/patterns.md](references/patterns.md) for multi-agent architectures, specialization patterns, and reporting hierarchies.
