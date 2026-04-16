# Vault System

Encrypted per-agent credential store. Agents access credentials at runtime via tools — credentials never go in system prompts or config files.

## Architecture

- **Encrypted at rest**: AES-256-GCM (file backend) or pgcrypto (PostgreSQL)
- **Per-agent scoping**: each agent has isolated credentials. Agent A cannot access Agent B's vault.
- **Service-based**: multiple credential entries per agent (one for SMTP, one for API key, etc.)

## VaultEntry Structure

```typescript
{
  type: "smtp" | "imap" | "oauth" | "api_key" | "login" | "custom",
  label?: string,                        // Display name
  credentials: Record<string, string>,   // Key-value pairs
}
```

Credential values support `${ENV_VAR}` syntax — resolved from environment at runtime.

## Credential Resolution Chain

When a tool needs credentials (e.g., email_send needs SMTP):

1. **Tool parameters** — explicit overrides in the tool call
2. **Agent vault** — per-agent encrypted entries (`vault_get`)
3. **Environment variables** — global fallback (.env)

## Agent Tools

| Tool | Description |
|------|-------------|
| `vault_get` | Get credentials for a named service (always available, no allowedTools needed) |
| `vault_list` | List available vault entries — metadata only, values masked |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/agents/{agent}/vault/{service}` | Store credentials |
| GET | `/v1/agents/{agent}/vault` | List all entries (masked) |
| DELETE | `/v1/agents/{agent}/vault/{service}` | Remove an entry |

## VaultStore Interface

Full operations (used by the server, not by agents directly):

- `get(agent, service)` — single entry
- `getAllForAgent(agent)` — all entries
- `set(agent, service, entry)` — add/update
- `patch(agent, service, partial)` — merge credentials
- `remove(agent, service)` — delete
- `list(agent)` — metadata only (masked values)
- `hasEntries(agent)` — boolean check
- `renameAgent(old, new)` — bulk rename
- `removeAgent(agent)` — delete all

## Example: Email Agent Setup

```bash
# Store SMTP credentials via API
curl -X POST https://{slug}.polpo.cloud/v1/agents/emailer/vault/gmail \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -d '{ "type": "smtp", "credentials": { "host": "smtp.gmail.com", "port": "587", "user": "...", "pass": "..." }}'
```

Agent config:
```json
{ "agent": { "name": "emailer", "allowedTools": ["email_*"], "emailAllowedDomains": ["company.com"] }, "teamName": "default" }
```

At runtime, `email_send` calls `vault_get("gmail")` automatically.

Source: `packages/core/src/vault-store.ts`
