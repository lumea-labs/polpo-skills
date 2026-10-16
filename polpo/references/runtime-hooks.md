# Runtime Hooks

Runtime Hooks are versioned project policy packs in `.polpo/hooks/<name>.json`. An agent opts in
with `"hooks": ["name"]`. The runtime resolves an immutable snapshot for each invocation, so a
mid-run deployment cannot change the policy under an active tool or model step.

Use hooks for lifecycle observation, audit delivery, tool-input policy, output normalization,
and bounded prompt or verifier-agent checks. Do not use them to replace tool authorization,
approval, schema validation, Connections, guardrails, or deterministic Loop control flow.

Controlling hooks run sequentially by scope, priority, and declaration order. Observe-only hooks
run concurrently and cannot alter the decision. Decisions are `allow`, `deny`, `ask`, `defer`,
`modify`, and `stop`. A `turn:stop` feedback decision receives at most one extra model step and
never replays completed tools.

Handlers are `command`, public `https`, Polpo `tool`, `mcp_tool`, bounded `prompt`, or bounded
`agent`. Keep secrets out of hook JSON and event payloads. Authenticate HTTPS through a named
Connection. Provider-native tools execute at the provider; pre-side-effect control therefore
requires a locally executed Polpo or Connection tool.

Validate locally before deployment:

```bash
polpo hooks validate
polpo hooks list --local
polpo deploy
polpo hooks list
```
