# Agent Architecture Patterns

## Single Specialist

One agent, one job. Start here.

```typescript
{
  name: "coder",
  role: "Full-stack engineer",
  model: "xai:grok-4-fast",
  allowedTools: ["bash", "read", "write", "edit", "glob", "grep"],
}
```

## Specialists Team

Multiple agents, each with a focused role. Agents are assigned tasks based on expertise.

```typescript
// Fast coder for implementation
{ name: "coder", role: "Engineer", model: "xai:grok-4-fast", allowedTools: ["bash", "read", "write", "edit", "glob", "grep"] }

// Careful reviewer (stronger model, read-only tools)
{ name: "reviewer", role: "Code reviewer", model: "anthropic:claude-sonnet-4-5", allowedTools: ["read", "grep", "glob"] }

// Research agent with web access
{ name: "researcher", role: "Technical researcher", model: "openai:gpt-4o", allowedTools: ["search_web", "http_fetch", "read", "write"] }
```

## Reporting Hierarchy

Use `reportsTo` to define escalation paths. When an agent is stuck or needs approval, it escalates to its manager.

```typescript
{ name: "junior", role: "Junior dev", model: "xai:grok-3-mini-fast", reportsTo: "senior" }
{ name: "senior", role: "Senior dev", model: "xai:grok-4-fast", reportsTo: "lead" }
{ name: "lead", role: "Tech lead", model: "anthropic:claude-sonnet-4-5" }
```

## Agent with External Services

Agent that interacts with external APIs via vault credentials.

```typescript
{
  name: "emailer",
  role: "Email outreach agent",
  model: "xai:grok-4-fast",
  allowedTools: ["email_send", "email_read", "http_fetch", "write"],
  emailAllowedDomains: ["company.com", "client.com"],  // restrict recipients
}
// + vault entry for email credentials
```

## Reasoning Levels

Control how much the agent "thinks" before responding.

| Level | Use Case |
|-------|----------|
| `off` | Simple, fast tasks (formatting, lookups) |
| `minimal` | Standard coding tasks |
| `medium` | Complex debugging, architecture |
| `high` | Multi-step reasoning, hard problems |
| `xhigh` | Research, novel problem solving |

```typescript
{ name: "architect", reasoning: "high", model: "anthropic:claude-sonnet-4-5" }
{ name: "formatter", reasoning: "off", model: "xai:grok-3-mini-fast" }
```

## Volatile Agents

Agents created for a single mission and cleaned up after. Use for temporary, mission-specific specialists.

```typescript
{ name: "temp-analyst", role: "Data analyst", volatile: true, missionGroup: "q4-report" }
// Automatically removed when the mission completes
```
