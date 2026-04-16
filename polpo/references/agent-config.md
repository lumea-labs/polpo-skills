# AgentConfig — Complete Field Reference

Source: `packages/core/src/types.ts`

## Core Identity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | yes | Unique identifier within the project |
| `role` | `string` | no | Human-readable job title ("Senior Engineer") |
| `model` | `string` | no | LLM in `provider/model` format ("xai/grok-4-fast") |
| `createdAt` | `string` | no | ISO timestamp, auto-set on creation |

## Execution

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `allowedTools` | `string[]` | `[]` | Tool whitelist. Supports globs: `"browser_*"` |
| `allowedPaths` | `string[]` | `[workDir]` | Filesystem sandbox paths |
| `maxTurns` | `number` | `150` | Max LLM conversation turns per session |
| `maxConcurrency` | `number` | — | Max parallel tasks this agent can handle |
| `reasoning` | `ReasoningLevel` | — | Thinking depth: `"off"` \| `"minimal"` \| `"low"` \| `"medium"` \| `"high"` \| `"xhigh"` |
| `systemPrompt` | `string` | — | Base prompt injected at session start |
| `skills` | `string[]` | — | Skill names to load (from `.polpo/skills/` or global) |

## Organization

| Field | Type | Description |
|-------|------|-------------|
| `reportsTo` | `string` | Agent name for escalation chain |
| `volatile` | `boolean` | Auto-delete when parent mission completes |
| `missionGroup` | `string` | Which mission group this volatile agent belongs to |

## Identity (for human-facing agents)

```typescript
identity: {
  displayName?: string;      // "Alice Chen"
  title?: string;            // "Social Media Manager"
  company?: string;          // Organization name
  email?: string;            // Primary email (default SMTP sender)
  bio?: string;              // Agent persona description
  timezone?: string;         // "Europe/Rome"
  avatar?: string;           // Path to image (.polpo/avatars/alice.png)
  tone?: string;             // "Professional but warm"
  personality?: string;      // "Detail-oriented perfectionist"
  responsibilities?: Array<string | {
    area: string;
    description: string;
    priority: "critical" | "high" | "medium" | "low";
  }>;
  socials?: Record<string, string>; // { github: "alice", twitter: "@alice" }
}
```

## Tool-Specific Config

| Field | Type | Description |
|-------|------|-------------|
| `browserProfile` | `string` | Cookie/auth persistence key (default: agent name) |
| `emailAllowedDomains` | `string[]` | Restrict which domains the agent can email |

## Registry Metadata (optional)

| Field | Type | Description |
|-------|------|-------------|
| `version` | `string` | Semantic version (for Ink registry) |
| `author` | `string` | "Name \<email\>" |
| `tags` | `string[]` | Discovery tags |
