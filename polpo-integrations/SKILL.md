---
name: polpo-integrations
description: Build secure Polpo integrations using Connections, custom tools, trusted invocation context and hidden bindings, MCP servers, OAuth, and complete tool bundles. Use for credentials, tenant-scoped connection selection, tool packaging/execution, grants, scopes, or external service integration.
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

## Invariants

- Connection IDs and credentials are not model-controlled tool arguments.
- `ToolInvocationContext` is copied, JSON-validated, deeply frozen, and host-owned.
- `serverBindings` can read only supported immutable invocation paths.
- Hidden bindings and Connection capabilities never enter model history or serialized tool
  arguments.
- A tool cannot widen its granted scopes, filesystem access, or execution surface.
- Packaging failure is detected before deployment; runtime 502 is not an acceptable dependency
  discovery mechanism.

## References

- [references/custom-tools.md](references/custom-tools.md)
- [references/trusted-context-and-bindings.md](references/trusted-context-and-bindings.md)
- [references/connections.md](references/connections.md)
- [references/mcp-and-oauth.md](references/mcp-and-oauth.md)
- [references/packaging-and-runtime.md](references/packaging-and-runtime.md)
- [references/contract-version.md](references/contract-version.md)
