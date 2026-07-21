# Connections

Connections are the current credential and connector layer for external services. Use them for new integrations when the dashboard/API exposes them. Vault remains supported for legacy file-based credentials and local compatibility.

## Concepts

| Concept | Meaning |
|---|---|
| `api_key` connection | Stores a server-side API key or header set for a service. |
| `oauth2` connection | Stores OAuth tokens after a user/admin authorizes an external account. |
| `mcp` connection | Stores a remote MCP endpoint plus headers/credentials and discovers tools from that server. |
| Subject scope | `project`, `org`, `agent`, `user`, or `service`; cloud project integrations are usually project-scoped first. |

Connection secrets are resolved server-side. Do not paste raw OAuth tokens or service API keys into agent prompts.

## Cloud project API

Cloud routes are project-scoped:

| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/projects/{projectId}/connect/providers` | List configured/available providers. |
| GET | `/v1/projects/{projectId}/connect/connections` | List existing project connections. |
| POST | `/v1/projects/{projectId}/connect/connections/api-key` | Create an API-key connection. |
| POST | `/v1/projects/{projectId}/connect/connections/mcp` | Create a remote MCP URL connection. |
| DELETE | `/v1/projects/{projectId}/connect/connections/{connectionId}` | Revoke/delete a connection. |
| POST | `/v1/projects/{projectId}/connect/oauth/start` | Start an OAuth connection flow. |
| GET | `/v1/projects/{projectId}/connections/callback` | Dashboard callback page for OAuth. |
| POST | `/v1/projects/{projectId}/connect/connections/{connectionId}/mcp/discover` | Discover tools for a remote MCP connection. |
| POST | `/v1/projects/{projectId}/connect/connections/{connectionId}/actions/{actionId}` | Execute a connection-backed action. |

The dashboard may expose curated providers such as GitHub, Slack, Google Drive, and remote MCP URL. Treat provider availability as instance/config dependent.

## Generic server API

When the generic Connect route factory is mounted, it exposes:

| Method | Path | Purpose |
|---|---|---|
| GET | `/connect/providers` | List provider definitions. |
| GET | `/connect/connections` | List connections. |
| POST | `/connect/connections/api-key` | Create API-key connection. |
| POST | `/connect/oauth/start` | Start OAuth. |
| GET | `/connect/oauth/callback` | Complete OAuth. |
| GET | `/connect/connections/{id}/token` | Resolve token server-side. |
| DELETE | `/connect/connections/{id}/revoke` | Revoke/delete. |

## Custom tools

Custom tool functions receive a `ctx.connections` helper:

```ts
const token = await ctx.connections.getToken("github");
const apiKey = await ctx.connections.getKey("stripe", "apiKey");
const headers = await ctx.connections.getHeaders("my-service");
```

Use `ctx.connections` for new tools. Use `ctx.vault` only when maintaining older vault-based tools.

## MCP

Remote MCP can be configured as a Connection or directly in `agent.mcpServers`.

Prefer a Connection when using the dashboard/cloud because it can store credentials, discover official tool metadata, and grant selected tools to agents.

Use `agent.mcpServers` when the MCP endpoint is part of the code/config:

```json
{
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer ${vault:notion:key}" }
    }
  }
}
```

Tools from that server are named `mcp__<server>__<tool>`.
