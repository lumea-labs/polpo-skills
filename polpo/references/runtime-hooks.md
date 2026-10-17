# Runtime Hooks

A hook pack lets trusted project code observe or control an agent at fixed points: before a tool
runs, after the model answers, when a turn is about to end, and so on. Use hooks for audit
callbacks, tool-input policy, output clean-up, and a final quality check. Do not use them instead
of `allowedTools`, approvals, guardrails, Connections, or a Project Loop: hooks can narrow what
happens, never grant more.

Requires Polpo `0.18.8` or later.

## Create A Pack

Put each pack in `.polpo/hooks/<name>.json`; `name` must equal the file name. Attach it to an
agent with `"hooks": ["<name>"]` in `agent.json`. The same pack then applies to direct chat,
Run-backed chat, Channel turns, and the agent's nodes inside Project Loops.

```json
{
  "version": 1,
  "name": "guardrails",
  "hooks": [
    {
      "id": "block-deletes",
      "event": "tool:before",
      "matcher": { "tools": ["delete_*", "*_delete"] },
      "onFailure": "block",
      "handler": {
        "type": "http",
        "url": "https://policy.example.com/polpo/tool-check",
        "connection": "policy-api",
        "timeoutMs": 2000
      }
    },
    {
      "id": "audit",
      "event": "tool:after",
      "mode": "observe",
      "handler": { "type": "http", "url": "https://audit.example.com/polpo" }
    }
  ]
}
```

Then:

```bash
polpo hooks validate          # local schema check of .polpo/hooks/*.json
polpo deploy                  # uploads hook packs before the agents that use them
polpo hooks list              # what the target project has
polpo hooks capabilities      # the hook contract the target host advertises
```

`polpo deploy` creates and updates packs but never deletes a remote pack you removed locally.

## Hook Fields

| Field | Values | Default |
|---|---|---|
| `id` | 1–128 characters, unique in the pack | required |
| `event` | an event name from the list below | required |
| `handler` | see Handlers | required |
| `matcher` | `surfaces` (`chat`, `loop`, `channel`, `task`, `schedule`, `runtime`), `agents`, `loops`, `steps`, `tools`; exact strings or `*`/`?` globs | matches everything |
| `mode` | `control` (can change the outcome) or `observe` (runs in parallel, ignored for the outcome) | `control` |
| `onFailure` | `continue` (treat as allow) or `block` (deny on error or timeout) | `continue` |
| `priority` | integer; lower runs first | `0` |
| `scope` | `platform`, `organization`, `project`, `environment`, `agent`, `skill`, `loop`, `step`; only affects ordering | `project` |
| `enabled`, `allowRecursive` | booleans; recursion is off unless set | |

Controlling hooks run one after another by scope, priority, then file order; the first `deny`,
`ask`, `defer`, or `stop` ends the chain. `matcher.tools` only matches tool events.

## Events That Can Change The Outcome

| Event | What a decision does |
|---|---|
| `tool:before` | `deny`/`ask`/`defer`/`stop` block the call (the model sees an error result). `modify` with `data.input` replaces the arguments before normal authorization and schema validation. |
| `tool:after`, `tool:error` | `modify` with `data.result` (string) replaces what the model sees. |
| `input:before` | Blocking decisions fail the turn. `modify` with `data.context` (string) adds text to the system prompt. |
| `model:before`, `model:after`, `model:switch:before`, `model:switch:after`, `agent:spawn`, `sandbox:start` | Blocking decisions fail the turn. |
| `loop:start`, `step:before`, `loop:transition`, `step:after`, `loop:end` | Blocking decisions stop the Project Loop. |
| `turn:stop` | `stop` with a non-empty `feedback` runs one extra model call without tools to revise the answer, then checks again; a second failure fails the turn. Skipped for structured output. |

Other events (`session:*`, `run:*`, `turn:error`, `agent:end`, `context:compact:*`,
`tool:batch:after`, `sandbox:file_changed`, `sandbox:end`, `approval:request`, `loop:stop`)
are notifications: decisions are ignored, so use `mode: "observe"`.

`ask` and `defer` currently behave like `deny`; they do not open an approval prompt. The
`turn:stop` data has the answer's length and tool-call count, not its text.

## Handlers

A handler answers with JSON `{"decision": {...}}`. Empty or non-JSON output means allow.

```json
{ "decision": { "action": "deny", "reason": "Deletes are disabled", "code": "no_deletes" } }
```

Decision shapes: `allow`, `deny{reason, code?}`, `ask{reason}`, `defer{reason}`,
`modify{data}`, `stop{reason?, feedback?}`.

| `type` | Fields | Notes |
|---|---|---|
| `http` | `url`, optional `connection`, `headers` | POSTs the redacted event envelope with `x-polpo-hook-event` and `x-polpo-hook-idempotency-key`. Public HTTPS only; private addresses and redirects are rejected. Authenticate with a Connection, never a header. |
| `command` | `command`, optional `args`, `cwd`, `env` | Runs in the project workspace or sandbox. On the stock Node host it gets `POLPO_HOOK_EVENT`, `POLPO_HOOK_EVENT_ID`, and `POLPO_HOOK_IDEMPOTENCY_KEY` as environment variables, not the event body. Non-zero exit is a failure. |
| `tool` | `tool`, optional `input` | Calls a Polpo tool the agent is allowed to use. |
| `mcp_tool` | `connection` (MCP server), `tool`, optional `input` | Calls an MCP tool through an authorized Connection. |
| `prompt` | `prompt`, optional `model`, `maxOutputTokens` (≤ 32768) | One bounded model evaluation. |
| `agent` | `agent`, `prompt`, optional `allowedTools`, `maxTurns` (≤ 20) | A bounded verifier agent. |

Every handler accepts `timeoutMs` (1–300000, default 5000). Header and `env` names that look
like secrets (`authorization`, `token`, `api_key`, `password`, ...) are rejected: keep credentials
in Connections. Handlers that cause side effects should honour the idempotency key, because a
resumed run can deliver the same event again.

## Where Each Handler Works

- **Self-hosted (stock server):** hooks run automatically for agents that list them, but only
  `command` and `http` without `connection` work. `tool`, `mcp_tool`, `prompt`, `agent`, and
  `http` with a `connection` need host adapters (`runtimeHookHost` when embedding the server);
  without them the handler fails, which with `onFailure: "continue"` silently allows. The stock
  `GET /api/v1/hooks/capabilities` lists the whole contract, not the adapters you configured, so
  test each handler with a real run.
- **Polpo Cloud:** availability depends on the project's rollout. Check `polpo hooks list` and a
  real run before relying on a handler type.
- `polpo hooks validate` checks the schema only. A `tool:before` hook that denies a
  provider-executed native tool cannot stop it, because the provider runs it; control requires a
  locally executed Polpo or Connection tool.
