# MCP And OAuth

## MCP

In managed Polpo, create a Connection, discover its MCP tools, and explicitly assign
the allowed tools to the agent. The assignment and grant authorize brokered runtime
access; do not copy remote endpoints or secrets into agent JSON.

Self-hosted OSS also supports authored `stdio`, HTTP, or SSE MCP configuration.
Authentication must use a Connection or trusted host configuration, not an inline
token inside `.polpo/agents/.../agent.json`.

Treat discovered MCP tools like any other tool: apply agent and surface policy, validate schemas,
mark sandbox requirements accurately, bound initialization time, and isolate a failing MCP server
from unrelated tools when possible.

Never expose an MCP endpoint selected by model text. Server names and transports are authored
configuration; runtime discovery can only reveal tools from authorized servers.

`polpo connections mcp connect <catalog-id|https-endpoint>` opens the existing
dashboard setup form for review. It does not start OAuth with the CLI key.
`--json`/`--no-open` print `setupUrl`; local/custom hosts can use `--dashboard-url`.
The browser authenticates independently and the user confirms setup. Advanced
owner/binding/authentication flags are rejected rather than placed in URL state.

## OAuth

Managed Cloud may initiate OAuth through a secure handoff URL and receive callbacks without
showing the administrative dashboard. The public application receives only expiring setup state,
not provider secrets.

Bind the completed Connection to the authenticated project and trusted principal/tenant/resource.
Validate state, redirect allowlist, PKCE/provider requirements, expiry, replay, revoked consent,
and granted scopes. OAuth completion does not automatically grant every agent or tool access.

The in-development Connections contract also supports embedded MCP OAuth through
a reusable host configuration. Verify the deployed host and CLI support before
using it; the published Data release alone does not include these changes.
Configure server URL, transport and `dynamic`, `metadata_document` or
`pre_registered` registration with `polpo connections mcp configurations create
<private-json-file>`. List configurations to obtain their IDs and revisions;
update/revoke requires `--revision`. Project scope is the default; use
`--organization <id>` for organization scope; this requires an authenticated admin
but no locally linked project. Client secrets stay in private files
and encrypted storage, never shell arguments, agent JSON or conversations.

The same unpublished contract includes **MCP OAuth setups** in project Connections
and organization administration. Copy the setup ID for CLI/SDK use; configuration
and account consent are separate steps. An omitted registered-client secret is
retained only for an unchanged server, transport, Connector/authentication method
and client ID. A different target requires a new secret or explicit no-secret
selection. Reload the saved configuration after a revision conflict.

The trusted backend selects `configurationId` when creating the setup session.
An end user can then complete the pinned MCP consent without a Polpo session.
The separate manual dashboard flow still requires its initiating Polpo session.
MCP reconnect requires a new Connection and explicit tool reassignment until
verified account continuity exists.

Managed OAuth uses Polpo's provider application; customer OAuth uses the configured
customer application's identity on the provider consent screen. Both can use Polpo's
callback and encrypted storage. Neither choice changes who owns the Connection or
which agent grants are required. Application backends initiate end-user setup and
invoke agents; direct provider proxying for application backends is outside scope.
