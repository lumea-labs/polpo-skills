# Vault — Legacy Encrypted Credentials

Per-agent encrypted credential store. Use this for existing file-based projects and compatibility with older agents. For new external integrations, prefer Connections when the host/dashboard exposes the provider.

Agents access vault credentials at runtime through `vault_get` / `vault_list` tools. Credentials never appear in system prompts or chat history.

## Concept

Each agent has its own scope. The runtime decrypts just-in-time and exposes only that agent's credentials via tools. Cross-agent access is blocked by design.

Common legacy services: LLM provider keys, search (Exa), email (SMTP/IMAP credentials), database logins, OAuth tokens.

## File format

Local vault is stored as `.polpo/vault.enc` — an AES-256-GCM encrypted blob. The encryption key is read from:
1. Env var `POLPO_VAULT_KEY` (preferred for CI / multi-machine), OR
2. `~/.polpo/vault.key` (preferred for local dev)

The unencrypted JSON it wraps has this shape:

```json
{
  "<agent-name>": {
    "<service-name>": {
      "type": "api_key" | "smtp" | "imap" | "oauth" | "login" | "custom",
      "label": "human-readable name (optional)",
      "credentials": { /* type-specific fields */ }
    }
  }
}
```

You typically don't edit `vault.enc` by hand. Instead:
- Use the dashboard (writes via the API)
- Use the API directly (curl examples below)
- Or programmatically populate the file via the `@polpo-ai/vault-crypto` package and let `polpo deploy` push it

If a Connection exists for the same service, use that instead of adding a new vault entry.

## Deploy behavior

`polpo deploy` reads `.polpo/vault.enc`, decrypts it with your local key, and `POST`s each `{agent, service}` to `/v1/vault/entries`. The cloud re-encrypts with its own key at rest. Local key never leaves your machine.

If the vault key is missing, deploy fails fast with `vault: cannot resolve key — set POLPO_VAULT_KEY or ensure ~/.polpo/vault.key exists`.

## API endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/v1/vault/entries` | `SaveVaultEntryBody` (discriminated by `type`) | `{agent, service, type, keys}` (metadata only) |
| GET | `/v1/vault/entries/{agent}` | — | list of `{service, type, label?, keys}` — **metadata only, never values** |
| PATCH | `/v1/vault/entries/{agent}/{service}` | partial update body | `{agent, service, type, keys}` |
| DELETE | `/v1/vault/entries/{agent}/{service}` | — | `{removed: true}` |

Note: there's no `GET /v1/vault/entries/{agent}/{service}` (security choice — values must not be retrievable). At runtime only the agent itself sees the resolved values, via tools.

## Credential types

### `api_key`
```json
{
  "agent": "researcher",
  "service": "openai",
  "type": "api_key",
  "label": "OpenAI prod",
  "credentials": { "key": "sk-..." }
}
```

### `smtp` (outbound email)
```json
{
  "agent": "notifier",
  "service": "sendgrid",
  "type": "smtp",
  "credentials": {
    "host": "smtp.sendgrid.net",
    "port": "587",
    "user": "apikey",
    "pass": "SG...",
    "from": "alerts@acme.com",
    "secure": "false"
  }
}
```

### `imap` (inbound email)
```json
{
  "agent": "researcher",
  "service": "gmail",
  "type": "imap",
  "credentials": {
    "host": "imap.gmail.com",
    "port": "993",
    "user": "research@acme.com",
    "pass": "app-password"
  }
}
```

### `oauth`
```json
{
  "agent": "analyst",
  "service": "stripe",
  "type": "oauth",
  "credentials": {
    "access_token": "sk_live_...",
    "refresh_token": "rt_...",
    "expires_at": "2026-12-01T00:00:00Z",
    "client_id": "...",
    "client_secret": "...",
    "scope": "..."
  }
}
```

### `login` (username/password)
```json
{
  "agent": "scraper",
  "service": "internal-db",
  "type": "login",
  "credentials": { "username": "bot", "password": "..." }
}
```

### `custom` (arbitrary key-value)
```json
{
  "agent": "researcher",
  "service": "custom-api",
  "type": "custom",
  "credentials": {
    "endpoint": "https://api.example.com",
    "token": "xyz...",
    "tenant": "acme"
  }
}
```

## Runtime resolution

When an agent runs, the runtime adds two tools (if `vault_*` or `vault_get`/`vault_list` is in `allowedTools` — both are core, so always available):

| Tool | Returns | Notes |
|---|---|---|
| `vault_get(service, key?)` | the credential value (or specific field) | Returns the agent's own scope only |
| `vault_list()` | metadata list of services | No values |

The LLM sees the value only when it calls `vault_get`. It's not interpolated into the prompt itself.

For MCP server configurations, use `${vault:<service>:<key>}` interpolation in `headers` / `env`:
```json
"mcpServers": {
  "notion": {
    "type": "http",
    "url": "...",
    "headers": { "Authorization": "Bearer ${vault:notion:key}" }
  }
}
```

## Examples

### Set an OpenAI key for the `researcher` agent
```bash
curl -X POST https://my-project.polpo.cloud/v1/vault/entries \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "researcher",
    "service": "openai",
    "type": "api_key",
    "credentials": { "key": "sk-..." }
  }'
```

### List all credentials for an agent (metadata only)
```bash
curl -H "Authorization: Bearer $POLPO_API_KEY" \
  https://my-project.polpo.cloud/v1/vault/entries/researcher

# →
# {
#   "ok": true,
#   "data": [
#     { "service": "openai", "type": "api_key", "label": "OpenAI prod", "keys": ["key"] },
#     { "service": "exa",    "type": "api_key", "keys": ["key"] }
#   ]
# }
```

### Rotate a credential
```bash
curl -X PATCH https://my-project.polpo.cloud/v1/vault/entries/researcher/openai \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "type": "api_key", "credentials": { "key": "sk-new..." } }'
```

### Delete
```bash
curl -X DELETE https://my-project.polpo.cloud/v1/vault/entries/researcher/openai \
  -H "Authorization: Bearer $POLPO_API_KEY"
```

## Common service shapes (cheat sheet)

| Service | Type | Field names |
|---|---|---|
| `openai` | `api_key` | `key` |
| `anthropic` | `api_key` | `key` |
| `exa` | `api_key` | `key` |
| `fal` | `api_key` | `key` |
| `xai` | `api_key` | `key` |
| `gemini` | `api_key` | `key` |
| `sendgrid` | `smtp` | `host, port, user, pass, from, secure?` |
| `gmail` | `imap` | `host, port, user, pass` |
| `notion` | `api_key` | `key` |

## Common pitfalls

- **Using vault for a new integration when Connections exist** — prefer Connections; they can be project-scoped, OAuth-backed, MCP-aware, and managed from the dashboard.
- **Vault key not configured** — `polpo deploy` fails with a clear error. Set `POLPO_VAULT_KEY` env or `~/.polpo/vault.key`.
- **Trying to read a value from the API** — the GET endpoint returns metadata only. Values are only available to the agent at runtime via `vault_get`.
- **Wrong type discriminator** — every entry MUST have `type` matching one of the 6 known values; the API rejects unknown types.
- **Cross-agent leakage attempt** — there's no endpoint to read another agent's vault. The runtime scopes tools to the calling agent.
- **Putting credentials in `systemPrompt`** — anti-pattern. The vault is the only safe storage.
- **Forgetting to deploy after rotating a key locally** — `polpo deploy` ships the latest vault every run. Until you deploy, the cloud has the old key.
