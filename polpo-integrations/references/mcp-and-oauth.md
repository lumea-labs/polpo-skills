# MCP And OAuth

## MCP

Configure MCP servers in the agent using supported `stdio`, HTTP, or SSE transports. Remote MCP
authentication should reference a Connection or trusted host configuration, not an inline token
inside `.polpo/agents/.../agent.json`.

Treat discovered MCP tools like any other tool: apply agent and surface policy, validate schemas,
mark sandbox requirements accurately, bound initialization time, and isolate a failing MCP server
from unrelated tools when possible.

Never expose an MCP endpoint selected by model text. Server names and transports are authored
configuration; runtime discovery can only reveal tools from authorized servers.

## OAuth

Managed Cloud may initiate OAuth through a secure handoff URL and receive callbacks without
showing the administrative dashboard. The public application receives only expiring setup state,
not provider secrets.

Bind the completed Connection to the authenticated project and trusted principal/tenant/resource.
Validate state, redirect allowlist, PKCE/provider requirements, expiry, replay, revoked consent,
and granted scopes. OAuth completion does not automatically grant every agent or tool access.
