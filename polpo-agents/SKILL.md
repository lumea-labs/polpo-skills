---
name: polpo-agents
description: Create and configure Polpo agents. Covers `.polpo/agents/<name>/agent.json` and `instructions.md`, model IDs and model profiles, model and execution routing, `allowedTools` and tool loading, MCP servers, runtime skills, assigned Project Loops, chat questions and suggestions, Memory, Knowledge, database tool grants, and sandbox and volume defaults. Use this whenever the user wants to add, change, review, or debug a Polpo agent's definition or permissions, for example "make the support agent use a cheaper model", "let this agent read the CRM database", "give it web access", or "why can't the agent see this tool", even if they never say "agent.json". For calling an agent from code, use polpo-runtime instead.
---

# Polpo Agents

An agent is a directory: `.polpo/agents/<name>/agent.json` holds its configuration and
`instructions.md` holds its system instructions. The configuration is a **permission ceiling**.
Requests, Channel Routes, Loop steps, and trusted grants can narrow what the agent may do in a
given run, but nothing at runtime can widen it. So grant the smallest set that covers every
place the agent will be used, and narrow it further per surface when needed.

## Create Or Change An Agent

1. Read the existing agent directory, `.polpo/project.json`, and any model profiles before
   editing. Changing a shared profile changes every agent that uses it.
2. Write instructions in `instructions.md`. Put configuration in `agent.json` and never add
   `name`, `systemPrompt`, or `createdAt`; the directory name and `instructions.md` supply them.
3. Pick the model. Use a concrete ID from `polpo models list` (format `provider/model`, for
   example `openai/gpt-5`) or a profile reference `{ "profile": "support" }`. Turn on automatic
   routing only if the project defines a bounded set of profiles and a fallback.
4. Set `allowedTools` to the tools this agent needs anywhere, then narrow per surface with
   `chat.allowedTools` or `channels.allowedTools` if needed.
5. Attach capabilities explicitly: `skills` (installed with `polpo skills add`), `mcpServers`,
   and `assignedLoops`. Nothing is granted implicitly, even if it exists in the project.
6. Add Memory, Knowledge, database access, or sandbox defaults only when the use case needs them.
7. Check every referenced model profile, tool, skill, MCP server, volume, and Loop exists, then
   `polpo deploy` (Cloud) or reload the self-hosted runtime.

Minimal agent:

```json
{
  "role": "Answer customer questions about orders",
  "model": "openai/gpt-5",
  "allowedTools": ["http_fetch"],
  "skills": ["support-playbook"]
}
```

## Rules That Prevent Common Mistakes

- `allowedTools` decides what the agent may call. Writing "use the search tool" in
  instructions does not grant it. Once `allowedTools` is set, tools left out of it are removed;
  if it is omitted entirely, all core tools load. Exceptions: `vault_get`/`vault_list` are always
  available, and `skill_list`/`skill_read` are added whenever skills are assigned.
- `toolLoading` only decides how authorized tool schemas are shown to the model (all at once or
  on demand). It cannot grant a tool.
- Chat questions (`ask_user_question`) and suggestions need both the agent setting and a client
  that says it can render them.
- Database tools need two things: the `database_*` names in `allowedTools`, and a grant from the
  host (dashboard in Cloud, `POLPO_DATA_AGENT_GRANTS` self-hosted). Neither one alone is enough.
- Keep user identity, grants, Connection IDs, and credentials out of `agent.json` and
  `instructions.md`. The model can read its configuration, and these values belong to the host.
- Do not paste skill content, memory facts, or tool lists into `instructions.md`. The runtime
  already adds them, so duplicates drift out of date.

## References

- [references/definition.md](references/definition.md): every `agent.json` field, teams.
- [references/models-and-routing.md](references/models-and-routing.md): model IDs, profiles,
  automatic model routing, and direct-versus-Loop execution routing.
- [references/tools-and-skills.md](references/tools-and-skills.md): how tool permissions combine,
  tool loading, MCP servers, runtime skills.
- [references/memory-and-knowledge.md](references/memory-and-knowledge.md): per-user Memory
  versus project Knowledge, and how to test them.
- [references/databases.md](references/databases.md): database tools and grants.
- [references/sandbox.md](references/sandbox.md): sandbox isolation, lifecycle, and volumes.
- [references/contract-version.md](references/contract-version.md): checked version and minimums.
