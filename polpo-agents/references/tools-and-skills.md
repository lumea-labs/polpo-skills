# Tools And Skills

## How Tool Permissions Combine

`agent.allowedTools` is the ceiling. In each run, the tools the model can use are the
intersection of every restriction that applies:

```text
agent.allowedTools
  ∩ surface list (chat.allowedTools, channels.allowedTools, or the Loop step's tools)
  ∩ Channel Route tools (Channel turns only)
  ∩ request execution override
  ∩ trusted grants from the host
```

So adding a tool to a Route, a Loop step, or a request has no effect unless it is also in
`allowedTools`. When a user reports "the agent can't see tool X", check each layer in this order.

A Channel or chat restriction does not carry over into a Project Loop the conversation starts:
Loop permissions are recalculated from the agent, the Loop, and the step.

Client-side tools sent with a request (OpenAI `tools`) are also filtered by the surface list.
They are request capabilities and do not add to the agent's ceiling.

Runtime hook packs listed in the agent's `hooks` can block or rewrite a tool call before it runs
(`tool:before`). If a tool "always errors" with `Runtime hook deny`, look at the hook packs, not
the tool.

## Tool Loading

- `direct`: show every authorized tool schema to the model up front.
- `progressive`: show a discovery tool first and load schemas on demand. Useful for agents with
  many tools, because it keeps the prompt small.
- `auto` (recommended): the runtime chooses per run.

Loading mode only changes what the model sees. Discovery never reveals tools outside the
authorized set.

Tools that touch the filesystem or shell are marked `requiresSandbox`; they run inside the
sandbox and inside `allowedPaths`.

## MCP Servers

`mcpServers` attaches MCP servers to an agent. Self-hosted, you can configure stdio, HTTP, or
SSE servers directly. In Polpo Cloud, connect the server as a Connection, discover its tools,
and assign them (see `polpo-integrations`). In both cases, never put a token in `agent.json`;
use a Connection or the host's environment.

## Runtime Skills

A runtime skill is a folder with `SKILL.md` plus optional `references/`, `scripts/`, and
`assets/`, stored in `.polpo/skills/<name>/`. Install and assign it with the CLI:

```bash
polpo skills add owner/repository --skill support-playbook --agent support
```

The agent's `skills` array lists the skills it may use. At runtime the agent gets two tools:
`skill_list` (a compact index of its skills) and `skill_read`. `skill_read({ name })` returns the
SKILL.md with its text references; `skill_read({ name, path })` reads one file from the bundle.
Tell the agent to use `skill_read` for skill files, not general file tools.

A single request can prioritise assigned skills with `polpo.skills` (see `polpo-runtime`). It
adds emphasis for that request only and fails if the skill is not assigned to the agent.
