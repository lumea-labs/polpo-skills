# Runtime Hook Integrations

Runtime Hook handlers may call a Polpo tool, an MCP tool, or a public HTTPS endpoint. They do not
create a privileged integration path. Tool and MCP handlers use the agent's resolved tool palette,
trusted invocation context, policy, schema validation, and active Connection grants.

An authenticated HTTP handler declares `connection` in the hook pack. The host resolves the
credential immediately before the request and injects the appropriate header. Keep API keys,
OAuth tokens, authorization headers, signed URLs, and other secrets out of hook JSON, prompts,
event envelopes, results, and traces.

Use `mcp_tool` with the configured MCP server name and raw tool name. The runtime maps it to the
canonical `mcp__<server>__<tool>` capability and never falls back to a custom tool with the same
raw name. Revocation or an insufficient grant must fail like the corresponding ordinary tool
call.
