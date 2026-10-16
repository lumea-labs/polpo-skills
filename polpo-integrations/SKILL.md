---
name: polpo-integrations
description: Build secure Polpo integrations using Connections, custom tools, scoped ctx.data database access, trusted invocation context and hidden bindings, MCP servers, OAuth, and complete tool bundles. Use for credentials, tenant-scoped connection selection, tool packaging/execution, grants, scopes, or external service integration.
---

# Polpo Integrations

Keep model-visible arguments separate from host-owned identity, authorization, and credentials.
The model expresses intent; the runtime resolves trusted context and capabilities.

## Workflow

1. Decide whether the integration is a built-in tool, custom tool, MCP server, Channel handler,
   or request-scoped client tool.
2. Define the smallest model-visible JSON schema and separately define trusted bindings and
   Connection slots.
3. Resolve user, tenant, resource, scope version, and grants server-side before tool execution.
4. Package the complete relative source graph and validate it before upload.
5. Resolve only active Connections with all required scopes and an unambiguous trusted binding.
6. Execute with bounded time, cancellation, sandbox policy, idempotency, and redacted trace data.
7. Test denied scope, missing/ambiguous Connection, rotated credentials, timeout, retry, malformed
   result, and package dependency failures.
8. When an integration runs from a Runtime Hook, preserve the same tool policy, Connection grant,
   trusted invocation context, cancellation, and redaction checks as an ordinary agent tool call.

## Invariants

- A Connector defines API or MCP communication and supported authentication.
  A Connection is one authorized account; an OAuth Client configures the consent app.
  Managed versus customer-owned OAuth apps is independent of account ownership.
- Connection IDs and credentials are not model-controlled tool arguments.
- Use `mode: "gateway"` and `.request()` for brokered HTTP operations. Gateway
  slots cannot read credentials. Direct `legacy_credentials` slots coexist and
  require separate operator consent in Cloud; changing tool code is not consent.
- `ToolInvocationContext` is copied, JSON-validated, deeply frozen, and host-owned.
- `serverBindings` can read only supported immutable invocation paths.
- Hidden bindings and Connection capabilities never enter model history or serialized tool
  arguments.
- A tool cannot widen its granted scopes, filesystem access, or execution surface.
- Use the host-bound `ctx.data` capability for application records; do not inject database
  credentials or schema administration into model-visible tools.
- Packaging failure is detected before deployment; runtime 502 is not an acceptable dependency
  discovery mechanism.
- Runtime Hook JSON never contains credentials. Authenticated HTTP handlers name a Connection;
  MCP and tool handlers still pass through the ordinary agent allowlist and Connection grants.

## References

- [references/project-environments.md](references/project-environments.md): Connection and
  OAuth environment ownership, with the current release boundary.
- [references/data-capability.md](references/data-capability.md): `ctx.data`, SQL queries,
  grants, retries and isolated gateway execution.
- [references/custom-tools.md](references/custom-tools.md)
- [references/trusted-context-and-bindings.md](references/trusted-context-and-bindings.md)
- [references/connections.md](references/connections.md): domain model, grants,
  gateway/direct coexistence and trusted account selection.
- [references/connection-cli.md](references/connection-cli.md): existing CLI
  setup, verification, OAuth applications and agent assignment commands.
- [references/mcp-and-oauth.md](references/mcp-and-oauth.md): MCP discovery,
  managed/customer OAuth and embedded account consent.
- [references/packaging-and-runtime.md](references/packaging-and-runtime.md)
- [references/runtime-hooks.md](references/runtime-hooks.md)
- [references/contract-version.md](references/contract-version.md)
