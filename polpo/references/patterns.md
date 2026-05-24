# Multi-Agent Patterns

Six proven shapes for composing Polpo agents. Each pattern includes when to use it, the `agents.json` skeleton, and the antipattern to avoid.

---

## 1. Linear handoff (A → B → C)

**When to use:** sequential workflow where each agent adds a layer (PM writes spec → engineer implements → reviewer signs off). Most demos start here.

**Shape:**
```json
[
  {
    "agent": {
      "name": "pm",
      "role": "Product manager",
      "systemPrompt": "Write a clear feature spec: user story, ACs, rollout plan, why now."
    },
    "teamName": "product"
  },
  {
    "agent": {
      "name": "engineer",
      "role": "Backend engineer",
      "systemPrompt": "Implement the spec. Tests + clean API. Ask for clarity if spec is incomplete.",
      "reportsTo": "pm"
    },
    "teamName": "engineering"
  },
  {
    "agent": {
      "name": "reviewer",
      "role": "Code reviewer",
      "systemPrompt": "Read spec + code + tests. Block on missing tests, security gaps, edge cases.",
      "reportsTo": "engineer",
      "allowedTools": ["read", "glob", "grep"]
    },
    "teamName": "engineering"
  }
]
```

Shared memory establishes the handoff convention; per-agent memory tracks what each is working on.

**Antipattern:** Circular feedback — reviewer asks engineer to revisit spec, engineer asks reviewer to re-read. Escalate to PM to break ties.

---

## 2. Fan-out / parallel specialization

**When to use:** one problem decomposes into independent subproblems best worked in parallel (architecture: DB design + API design + security review).

**Shape:**
```json
[
  {
    "agent": {
      "name": "orchestrator",
      "role": "Decomposer + synthesizer",
      "systemPrompt": "Break the problem into N independent subproblems. Dispatch each. Aggregate results."
    },
    "teamName": "leadership"
  },
  {
    "agent": {
      "name": "db-designer",
      "role": "Database schema specialist",
      "reportsTo": "orchestrator"
    },
    "teamName": "engineering"
  },
  {
    "agent": {
      "name": "api-designer",
      "role": "REST API surface specialist",
      "reportsTo": "orchestrator"
    },
    "teamName": "engineering"
  },
  {
    "agent": {
      "name": "security-reviewer",
      "role": "Security expert",
      "reportsTo": "orchestrator"
    },
    "teamName": "security"
  }
]
```

In a mission, the orchestrator's task has `dependsOn: ["db-designer", "api-designer", "security-reviewer"]` so it runs last and synthesizes.

**Antipattern:** Specialists finish in isolation and the orchestrator never reconciles cross-cutting concerns. Always have an explicit synthesis step that reads each specialist's output.

---

## 3. Spec → Build → Review (canonical Polpo example)

**When to use:** ship features every week with quality gates. This is the pattern in the `multi-agent` example in `polpo-ui/examples/multi-agent/`.

**Shape:**
```json
[
  {
    "agent": {
      "name": "product-manager",
      "role": "Owns roadmap + scope. Writes specs.",
      "systemPrompt": "Frame from user need, not solution. Score with RICE. Every spec needs a why-now.",
      "allowedTools": ["read","write","edit","glob","grep","memory_*"]
    },
    "teamName": "product"
  },
  {
    "agent": {
      "name": "backend-engineer",
      "role": "Translates specs to code + tests.",
      "systemPrompt": "Design API first. Test happy path + edges. Ask PM for clarity if spec is incomplete.",
      "allowedTools": ["read","write","edit","bash","glob","grep","http_fetch","memory_*"],
      "reportsTo": "product-manager"
    },
    "teamName": "engineering"
  },
  {
    "agent": {
      "name": "reviewer",
      "role": "Quality gate. Read-only.",
      "systemPrompt": "Read spec + code + tests. Block on missing tests, security gaps, edge cases. No code, just feedback.",
      "allowedTools": ["read","glob","grep","memory_*"],
      "reportsTo": "backend-engineer"
    },
    "teamName": "engineering"
  }
]
```

**Shared memory** carries the handoff conventions; **per-agent memory** carries each agent's running threads (PM tracks roadmap, engineer tracks test coverage, reviewer tracks spec flaws).

**Antipattern:** Engineer starts coding before the spec is final. Scope shifts under them. Always demand a "spec-ready" handoff signal from PM.

---

## 4. Volatile mission team (ephemeral workers)

**When to use:** large, one-off team for a specific mission (incident response, batch processing, product launch). Auto-cleanup when the mission ends.

**Shape:**
```json
[
  {
    "agent": {
      "name": "incident-commander",
      "role": "Incident commander",
      "systemPrompt": "Coordinate specialists, track timeline, communicate status every 5 min."
    },
    "teamName": "incident-response"
  },
  {
    "agent": {
      "name": "db-investigator",
      "role": "Database specialist",
      "volatile": true,
      "missionGroup": "incident-2025-05-25",
      "reportsTo": "incident-commander"
    },
    "teamName": "incident-response"
  },
  {
    "agent": {
      "name": "comms",
      "role": "Status page updater",
      "volatile": true,
      "missionGroup": "incident-2025-05-25",
      "reportsTo": "incident-commander"
    },
    "teamName": "incident-response"
  }
]
```

Volatile agents are auto-removed when their mission completes. `incident-commander` stays (no volatile flag) — it's the persistent on-call.

**Antipattern:** Volatile agents without `missionGroup` — cleanup misses them and they accumulate. Always pair `volatile: true` with `missionGroup: "<id>"`.

---

## 5. Mixed model tier (cost optimization)

**When to use:** triage with a cheap fast model, deep-dive with an expensive model, summarize back with a cheap one. Common when you want quality where it matters and speed elsewhere.

**Shape:**
```json
[
  {
    "agent": {
      "name": "classifier",
      "role": "Quick router",
      "model": "openai/gpt-4o-mini",
      "systemPrompt": "Classify the incoming request. Route 'analysis-heavy' to analyst, otherwise handle directly."
    },
    "teamName": "triage"
  },
  {
    "agent": {
      "name": "analyst",
      "role": "Deep analyst",
      "model": "anthropic/claude-opus-4-7",
      "systemPrompt": "Careful reasoning. Show your work. No shortcuts.",
      "reportsTo": "classifier",
      "reasoning": "high"
    },
    "teamName": "analysis"
  },
  {
    "agent": {
      "name": "summarizer",
      "role": "Output formatter",
      "model": "openai/gpt-4o-mini",
      "systemPrompt": "Turn the analyst's findings into a 3-bullet executive summary.",
      "reportsTo": "analyst"
    },
    "teamName": "reporting"
  }
]
```

**Antipattern:** Using expensive models everywhere ("just to be safe") — budget blows up. Or cheap models for security review — risky. Match model to task complexity.

---

## 6. MCP-augmented agent

**When to use:** agent needs specialized tools not in the built-in catalog (proprietary search index, custom internal API, domain-specific automation). Use Model Context Protocol servers.

**Shape:**
```json
[
  {
    "agent": {
      "name": "knowledge-bot",
      "role": "Internal knowledge search",
      "model": "anthropic/claude-sonnet-4-5",
      "allowedTools": [
        "read", "write",
        "mcp__internal_kb__search",
        "mcp__internal_kb__retrieve"
      ],
      "mcpServers": {
        "internal_kb": {
          "type": "http",
          "url": "http://kb-server.internal:8000",
          "headers": { "Authorization": "Bearer ${vault:kb:token}" }
        }
      },
      "systemPrompt": "Search the internal knowledge base. Cite the document URLs in your answers."
    },
    "teamName": "support"
  }
]
```

MCP tools are namespaced `mcp__<server>__<tool>` and must be listed individually in `allowedTools` (no wildcard expansion for MCP).

**Antipattern:** Building an MCP server for what built-in tools already cover. Start with `http_fetch` / `search_web` / `browser_*`; only add MCP when those genuinely don't fit.

---

## General anti-patterns (apply to all 6 patterns)

| Anti-pattern | Fix |
|---|---|
| Circular dependencies (A waits for B, B waits for A) | Escalation to a parent agent, or redesign the workflow |
| Unclear handoff contracts | Document them in shared memory + per-agent memory |
| Silent failures (agent stuck, no signal) | Set `maxTurns` + `maxDuration` per task; have agents explicitly say "I'm blocked" |
| Model tier mismatch (Opus for triage, mini for security) | Match model cost to task complexity |
| Fan-out without synthesis | Always have an aggregator/orchestrator step at the end |
| Volatile without missionGroup | Cleanup misses them; always pair both fields |
| `*` allowedTools on untrusted agent | Principle of least privilege; whitelist explicitly |
