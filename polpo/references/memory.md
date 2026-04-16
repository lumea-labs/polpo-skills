# Memory System

Persistent text context that agents read at the start of every session.

## Two Scopes

### Project Memory (`memory.md`)
Shared by ALL agents. Use for project context, conventions, architecture decisions.

File: `.polpo/memory.md`

```markdown
# Project Context
- Next.js 15 + TypeScript + Tailwind
- PostgreSQL via Drizzle ORM
- Deploy on Vercel

# Conventions
- Use Vitest for tests
- Prefer server components
- Use pnpm, not npm
```

### Agent Memory (`memory/<name>.md`)
Private to one agent. Auto-accumulated as the agent works.

File: `.polpo/memory/<agent-name>.md`

```markdown
# Learned Preferences
- User prefers functional style over classes
- Always run tests before committing
```

## How It Works

1. Memory is read at session start and prepended to the agent's system prompt
2. Agents can read/write memory via tools (`memory_get`, `memory_save`, `memory_append`, `memory_update`)
3. `memory_append` adds timestamped lines — builds up over time
4. Project memory is injected into ALL agents; agent memory only into that specific agent

## Tools

| Tool | Description |
|------|-------------|
| `memory_get` | Read project or agent memory content |
| `memory_save` | Overwrite memory content entirely |
| `memory_append` | Add a timestamped line to memory |
| `memory_update` | Find and replace text within memory |

Enable with `"memory_*"` in `allowedTools`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/memory` | Read project memory |
| PUT | `/v1/memory` | Write project memory |
| GET | `/v1/memory/agent/{name}` | Read agent memory |
| PUT | `/v1/memory/agent/{name}` | Write agent memory |

## Storage Backends

- **File** (default): `.polpo/memory.md` + `.polpo/memory/<name>.md`
- **SQLite**: via @polpo-ai/drizzle (same interface)
- **PostgreSQL**: via @polpo-ai/drizzle (encrypted with pgcrypto)

Source: `packages/core/src/memory-store.ts`
