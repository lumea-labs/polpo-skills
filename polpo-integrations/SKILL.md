---
name: polpo-integrations
description: Connect Polpo agents to external services safely. Covers custom tools (`defineTool` in `.polpo/tools/*.ts`, `polpo tools push/run`), Connections and connectors, OAuth apps and end-user consent, MCP servers, per-user and per-tenant account selection, hidden server bindings, credential slots, and `ctx.data` database access from tools. Use this whenever the user wants an agent to call an API, use Gmail/Google Drive/Slack/GitHub or another provider account, add an MCP server, let each end user connect their own account, write a custom tool, or debug "connection not found", "scope denied", or a tool that fails after deploy, even if they never say "Connection". For messaging Channels use polpo-channels.
---

# Polpo Integrations

The model should express what it wants; the host decides who is asking, which account to use,
and what that account may do. Keep those two halves apart:

- **Model-visible**: the tool's name, description, and `parameters` schema. Keep it minimal.
- **Host-owned**: user and tenant identity, the Connection used, credentials, scopes, and grants.
  These never appear in tool arguments, prompts, or Session history.

A model that can pick an account ID or pass a token can be talked into using the wrong one.

## Pick The Integration Type

| Need | Use |
|---|---|
| An existing MCP server (Linear, Notion, an internal one) | MCP via a Connection ([mcp-and-oauth.md](references/mcp-and-oauth.md)) |
| Your own logic or an HTTP API | A custom tool ([custom-tools.md](references/custom-tools.md)) using a Connection slot |
| The action happens in your app's UI | A client-side tool in the request (`polpo-runtime`) |
| Messaging (WhatsApp, Slack, ...) | `polpo-channels` |
| Application records | `ctx.data` ([data-capability.md](references/data-capability.md)) |

## Workflow

1. Inspect what exists: `polpo connections catalog`, `polpo connections list`, `polpo tools list`.
2. Create or reuse the Connection (the authorized account). For per-user accounts, start an
   end-user setup session from your backend ([connection-cli.md](references/connection-cli.md)).
3. Write the tool with the smallest `parameters` schema. Declare a logical Connection slot and
   any hidden bindings (tenant ID, site ID) instead of taking them as arguments.
4. Save it as `.polpo/tools/<name>.ts`. Try it with `polpo tools push` and
   `polpo tools run <name> --args '{...}'`, or deploy with `polpo deploy`.
5. Grant the agent the tool: add it to `allowedTools`, and grant the Connection slot to that
   agent and tool with `polpo connections grant-slot`.
6. Check with `polpo connections readiness --agent ... --tool ... --slot ...` before a real run.
7. Test the failure cases too: denied scope, no matching account, two matching accounts,
   revoked credentials, timeout.

## Rules

- A Connector describes an API or MCP server. A Connection is one authorized account using it.
  An OAuth Client is the app shown on the consent screen. They are separate decisions.
- Prefer `mode: "gateway"` slots with `.request()`: Polpo adds the credential outside your code,
  and the tool never sees it. Use `legacy_credentials` slots only when a library needs the raw
  token; in Cloud that also needs explicit operator consent per slot.
- A tool cannot gain scopes, filesystem access, or accounts beyond what it was granted.
- `ctx.data` gives tools record access within the agent's database grants; it never exposes
  database credentials or schema changes.
- Find missing files or dependencies before deploying. A 502 at runtime is the wrong place to
  discover them.

## References

- [references/custom-tools.md](references/custom-tools.md): `defineTool`, the tool context,
  testing.
- [references/connections.md](references/connections.md): Connections, slots, grants, and
  per-user account selection.
- [references/connection-cli.md](references/connection-cli.md): `polpo connections` commands
  for setup, OAuth apps, end users, and verification.
- [references/mcp-and-oauth.md](references/mcp-and-oauth.md): MCP servers and OAuth consent.
- [references/trusted-context-and-bindings.md](references/trusted-context-and-bindings.md):
  `ToolInvocationContext` and hidden bindings.
- [references/data-capability.md](references/data-capability.md): `ctx.data`.
- [references/packaging-and-runtime.md](references/packaging-and-runtime.md): multi-file tools,
  workspace paths, error handling.
- [references/contract-version.md](references/contract-version.md): checked version and minimums.
