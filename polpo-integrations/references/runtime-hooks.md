# Integrations Called From Runtime Hooks

A runtime hook pack (see the `polpo` skill) can call an external service or a tool when an event
happens. These calls follow the same rules as the agent's own calls; a hook is not a back door.

| Handler | How it reaches the service |
|---|---|
| `http` | POSTs the redacted event to a public HTTPS URL. For authentication, set `"connection": "<connection name>"`; the host adds the credential just before the request. |
| `tool` | Calls a Polpo tool, which must be in the agent's allowed tools, with the agent's grants. |
| `mcp_tool` | `connection` is the MCP server name and `tool` the raw tool name; Polpo calls `mcp__<server>__<tool>` and never falls back to a custom tool with the same name. |

- Never put API keys, tokens, `Authorization` headers, or signed URLs in hook JSON. The validator
  rejects header and environment names that look like secrets.
- A revoked Connection or missing grant makes the hook fail exactly like the tool call would.
  With `onFailure: "continue"` (the default) that means the event is allowed; use `"block"` when
  the check must succeed.
- Your HTTP endpoint receives `x-polpo-hook-idempotency-key`. Use it to ignore repeats, because a
  resumed run can send the same event again.
- On the stock self-hosted server only `http` without `connection` (and `command`) works; the
  others need host adapters.
