# Memory — Shared & Per-Agent Knowledge

Polpo's memory system gives agents persistent, markdown-based context that lives in source control and deploys with the project. Two levels: **shared** (project-wide, all agents see it) and **per-agent** (scoped to one agent, accessed at runtime via tools).

## File layout

```
.polpo/
├── memory.md                   # Shared — injected into every agent's system prompt
└── memory/                     # Per-agent
    ├── <agent-name>.md         # Filename MUST match agent.name exactly
    └── ...
```

## Format

**Pure markdown. NO frontmatter.** The server stores the content as an opaque string (`UpdateMemorySchema = { content: string }`). Any YAML/frontmatter you add is treated as part of the content.

This is the opposite of skills, which DO require frontmatter.

### Example — shared `memory.md`
```markdown
# Project — Quarterly KPI Review

Recurring quarterly review for leadership.

- **Stakeholders**: CEO, CFO, COO.
- **Cadence**: end of every fiscal quarter.
- **Data sources**: CRM, revenue dashboard, customer success logs.
- **Key dimensions**: revenue, churn, NPS, CAC, LTV.

## Conventions
- ARR is the headline metric (not MRR).
- CAC payback assumption: 14 months — validate against latest data before quoting.
- All external benchmarks cite source URL + access date.
```

### Example — per-agent `memory/analyst.md`
```markdown
# analyst — personal memory

## Style
- Numbers first, narrative second.
- Always include a "what changed since last quarter" section.

## Open threads
- Confirm whether ARR or MRR is the headline metric (see project memory).
- New customer cohort started in Q1 — track separately for first 90 days.

## Anti-patterns
- Charts without sources.
- Bullet lists longer than 5 items without a chart or table.
```

## Deploy behavior

`polpo deploy` walks `.polpo/memory.md` + `.polpo/memory/*.md` and pushes via the API:

| Local file | Endpoint |
|---|---|
| `.polpo/memory.md` | `PUT /v1/memory` with `{content}` |
| `.polpo/memory/<name>.md` | `PUT /v1/memory/agent/{name}` with `{content}` |

For per-agent files, **the filename (without `.md`) must match `agent.name` exactly** — the CLI does `file.replace(".md", "")` and uses that as the agent name in the URL.

Compare semantics: CLI fetches current remote, compares against local, and:
- If new → PUT
- If identical → skip
- If differs → prompt (or skip with `--force` disabled, push with `--force` enabled)

## Runtime access

**Shared memory** (`memory.md`):
- Auto-injected into every agent's system prompt at agent spawn time.
- Agents read it as context — no tool call needed.

**Per-agent memory** (`memory/<agent>.md`):
- Accessed via 4 tools (require `memory_*` in `allowedTools`):
  - `memory_get` — read the agent's own memory
  - `memory_save` — overwrite (use sparingly; prefer append)
  - `memory_append` — add a timestamped line
  - `memory_update` — find-and-replace a unique substring
- Each agent only sees its own scope. Cross-agent reads are blocked at the runtime layer (the tool is scoped to `agentMemoryScope(agentName)`).

Memory tools were added in 0.7.7 and require the runtime to inject a `MemoryStore` + the agent name. Inside Polpo this is automatic; in custom shells you need to pass both.

## API routes

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/v1/memory` | — | `{exists, content}` |
| PUT | `/v1/memory` | `{content: string}` | `{saved: true}` |
| GET | `/v1/memory/agent/{name}` | — | `{exists, content, agent}` |
| PUT | `/v1/memory/agent/{name}` | `{content: string}` | `{saved: true, agent}` |

## Patterns

### Cross-agent sharing
If two agents need to share state mid-mission, write to **shared memory** (agents read it on next turn) or have one agent produce a file the other reads. Per-agent memory is intentionally isolated.

### Knowledge base layering
- Project memory: domain, stakeholders, conventions (rarely changes)
- Per-agent memory: personal style, open threads, calibration notes (changes more)
- Skills (separate from memory): structured procedures (`.polpo/skills/<name>/SKILL.md`)

### Append-only logging
Use `memory_append` to log observations across sessions without losing prior context:
```
memory_append({text: "Customer X churned after 6 months — pattern: heavy export usage in month 1, drops to zero by month 4."})
```

## Common pitfalls

- **Filename mismatch with agent name** — `memory/analyst.md` will silently sit unused if your agent is named `data-analyst`. Names must match exactly (case-sensitive).
- **Adding frontmatter** — yaml frontmatter is stored verbatim as part of the content, then visible to the LLM. Strip it.
- **Forgetting `memory_*` in allowedTools** — agent has no way to access per-agent memory. Add `"memory_*"` to enable all 4 tools.
- **Using `memory_save` for incremental updates** — every save overwrites the whole memory. Use `memory_append` for logs and `memory_update` for surgical edits.
- **Trying to read another agent's memory** — not exposed by the runtime. If you need cross-agent state, use shared memory or a deliberate file handoff.
