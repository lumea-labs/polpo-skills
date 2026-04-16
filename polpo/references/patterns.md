# Agent Architecture Patterns

## Single Specialist

One agent, one job. Start here.

```json
{ "agent": { "name": "coder", "role": "Full-stack engineer", "model": "xai/grok-4-fast", "allowedTools": ["bash", "read", "write", "edit", "glob", "grep"] }, "teamName": "default" }
```

## Specialists Team

Multiple agents, each with a focused role:

```json
[
  { "agent": { "name": "coder", "role": "Engineer", "model": "xai/grok-4-fast", "allowedTools": ["bash", "read", "write", "edit", "glob", "grep"] }, "teamName": "default" },
  { "agent": { "name": "reviewer", "role": "Code reviewer", "model": "anthropic/claude-sonnet-4", "allowedTools": ["read", "grep", "glob"] }, "teamName": "default" },
  { "agent": { "name": "researcher", "role": "Research analyst", "model": "openai/gpt-4o", "allowedTools": ["read", "grep", "search_web", "http_fetch"] }, "teamName": "default" }
]
```

## Escalation Chain

Use `reportsTo` for escalation:

```json
[
  { "agent": { "name": "junior", "model": "xai/grok-3-mini-fast", "reportsTo": "senior" }, "teamName": "default" },
  { "agent": { "name": "senior", "model": "xai/grok-4-fast", "reportsTo": "lead" }, "teamName": "default" },
  { "agent": { "name": "lead", "model": "anthropic/claude-sonnet-4" }, "teamName": "default" }
]
```

## Email Agent with Vault

```json
{ "agent": { "name": "emailer", "role": "Email agent", "model": "xai/grok-4-fast", "allowedTools": ["email_*", "read", "write"], "emailAllowedDomains": ["company.com"] }, "teamName": "default" }
```
Plus vault entry for SMTP credentials (see vault.md).

## Browser Automation Agent

```json
{ "agent": { "name": "scraper", "role": "Web scraper", "model": "xai/grok-4-fast", "allowedTools": ["browser_*", "read", "write"], "browserProfile": "scraper" }, "teamName": "default" }
```

## Reasoning Levels

| Level | Use Case |
|-------|----------|
| `off` | Simple tasks (formatting, lookups) |
| `minimal` | Standard coding |
| `medium` | Complex debugging, architecture |
| `high` | Multi-step reasoning |
| `xhigh` | Research, novel problems |

## Typical Tool Profiles

| Role | Tools |
|------|-------|
| Coding agent | `bash`, `read`, `write`, `edit`, `glob`, `grep` |
| Research agent | `read`, `grep`, `glob`, `search_web`, `http_fetch` |
| Email agent | `email_*`, `read`, `write` |
| Browser agent | `browser_*`, `read`, `write`, `bash` |
| Full-stack | `bash`, `read`, `write`, `edit`, `glob`, `grep`, `http_fetch`, `search_web` |
| Document agent | `pdf_*`, `docx_*`, `excel_*`, `read`, `write` |
