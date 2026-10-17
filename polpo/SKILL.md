---
name: polpo
description: Set up, configure, validate, and deploy Polpo projects (the open-source AI agent runtime and Polpo Cloud). Use this whenever the repository has a `.polpo/` directory or imports `@polpo-ai/*` packages, or the user mentions Polpo, `polpo create`, `polpo deploy`, `polpo login`, self-hosting Polpo, or asks whether something works in Polpo Cloud versus self-hosted, even if they only say "add an agent" or "ship this". Also covers application databases from the CLI. Start here when unsure which Polpo skill applies; it routes to polpo-agents, polpo-runtime, polpo-channels, polpo-integrations, and polpo-react.
---

# Polpo Projects

Polpo is an agent runtime. A project is a `.polpo/` directory of agents, Loops, skills, tools,
and schedules, plus a runtime that serves them over an OpenAI-compatible API. The same project
runs in two places:

- **Polpo Cloud** (`polpo.sh`): managed runtime, one project per tenant, deployed with the CLI.
- **Self-hosted**: the open-source runtime (`lumea-labs/polpo`, Apache 2.0) on your own server.

Treat the checked-out project and the installed CLI as the source of truth. When this skill and
`polpo <command> --help` disagree, the help output wins, because the CLI ships more often than
this skill.

## First, Find Out Where You Are

Before changing anything, run or read:

1. `ls .polpo/` and `cat .polpo/project.json`. If `projectId`/`projectSlug` are present, the
   directory is linked to a Cloud project.
2. `polpo --version` and `polpo whoami`. If the CLI is missing: `npm i -g @polpo-ai/cli`.
3. If `.polpo/polpo.json` or `.polpo/agents.json` exist, the project uses the legacy layout. Run
   `polpo migrate --dry-run` and show the user the result before migrating.

Keep an existing link. Create or link a project only when the user asks for it or no project
exists yet, because `polpo link` pulls Cloud resources over local `.polpo/` files.

## Cloud Quickstart

```bash
polpo login                          # browser device-code sign-in
polpo create --name my-app           # new Cloud project + local .polpo/ scaffold + .env.local
# or: polpo link --project-id <uuid> # attach this directory to an existing project
```

Add an agent as a directory (details in `polpo-agents`):

```text
.polpo/agents/support/agent.json      {"role": "Customer support", "model": "openai/gpt-5"}
.polpo/agents/support/instructions.md # plain-Markdown system instructions
```

Then validate, deploy, and call it:

```bash
polpo loops validate                 # only if .polpo/loops/ exists
polpo hooks validate                 # only if .polpo/hooks/ exists
polpo deploy                         # Development; add --prod for Production
```

```bash
curl "$POLPO_URL/v1/chat/completions" \
  -H "Authorization: Bearer $POLPO_API_KEY" -H "Content-Type: application/json" \
  -d '{"agent":"support","messages":[{"role":"user","content":"Hi"}]}'
```

`polpo create` writes `POLPO_URL` (`https://<slug>.polpo.cloud`) and a project-scoped
`POLPO_API_KEY` (`sk_live_...`) to `.env.local`. Web templates (`--template chat`, `chat-widget`,
`multi-agent`) prefix both with `NEXT_PUBLIC_`, which puts the key in the browser bundle. That is
acceptable for a local prototype only; before shipping, move the key behind a server route (see
`polpo-react`).

## Development And Production

Cloud projects can have a Development and a Production environment with separate state and
credentials. Every CLI project command targets Development unless you pass `--prod` (or
`--env production`), on every command. Never switch to Production on your own initiative or
retry there after a Development failure. Read
[references/project-environments.md](references/project-environments.md) before deploying to
Production, wiring CI, or when a key is reported as `legacy` or `mixed`.

## Self-Hosted Quickstart

The runtime listens on port `3890`. The REST API is under `/api/v1`; chat completions and durable
runs are only under `/v1` (`/v1/chat/completions`, `/v1/runs/...`). Set `POLPO_API_KEY`:
**without it the server accepts unauthenticated requests**, and even with it a few setup routes
stay open, so keep port 3890 on a private network behind a proxy. Read [references/self-hosting.md](references/self-hosting.md) for the Docker Compose
stack, environment variables, and which features need extra wiring.

The CLI's project commands (`create`, `link`, `deploy`, `connections`, `channels`, `data`)
target the Cloud API. On a self-hosted runtime, author `.polpo/` files directly in the runtime's
`WORK_DIR` and use the HTTP API or SDK instead of `polpo deploy`.

## Working on a Project

1. Edit resources in the layout described in
   [references/project-layout.md](references/project-layout.md): one directory per agent, Loops
   in `.polpo/loops/`, skills in `.polpo/skills/`, hook packs in `.polpo/hooks/`, custom tools in
   `.polpo/tools/*.ts`, schedules in `.polpo/schedules/*.json`.
2. Validate before deploying: `polpo loops validate` and `polpo hooks validate`; check that every
   agent's `skills`, `hooks`, `allowedTools`, and `assignedLoops` refer to things that exist.
   Deploy order already puts skills, hooks, and tools before the agents that use them.
3. Never put provider secrets in `.polpo/` files. Use `polpo byok set`, Connections, or the
   host's environment.
4. Deploy with `polpo deploy`. A non-zero exit or any "failed" line means the deploy is not done.
   Fix the reported resource; running the same deploy again is not a fix.
5. Report back: which project, which resources changed, what you validated, and anything still
   pending in Cloud (for example a Channel waiting for provider verification).

Database schemas are not part of `polpo deploy`. Apply them as a separate step; see
[references/databases.md](references/databases.md).

## OSS or Cloud?

Short version: the runtime, contracts, SDKs, and file layout are open source; organizations,
billing, managed sandboxes, managed OAuth, the MCP server, and the Builder are Cloud-only.
[references/platform-boundaries.md](references/platform-boundaries.md) has the feature table.
Read it before promising a self-hosted user a feature, or when something works in Cloud but not
locally.

## References

- [references/project-layout.md](references/project-layout.md): read before creating or moving
  files in `.polpo/`.
- [references/cli-and-deploy.md](references/cli-and-deploy.md): every CLI command group, deploy
  behaviour, and failure handling.
- [references/project-environments.md](references/project-environments.md): Development and
  Production, `--prod`, keys, legacy Live/Test projects.
- [references/runtime-hooks.md](references/runtime-hooks.md): hook packs in `.polpo/hooks/`
  (audit, tool policy, final checks).
- [references/self-hosting.md](references/self-hosting.md): running the OSS runtime.
- [references/platform-boundaries.md](references/platform-boundaries.md): what each deployment
  supports.
- [references/databases.md](references/databases.md): `polpo data` administration.
- [references/contract-version.md](references/contract-version.md): the version this skill was
  checked against.

## Specialized Skills

- `polpo-agents`: agent definitions, models, tool policy, skills, Memory, Knowledge, sandboxes.
- `polpo-runtime`: calling agents (completions, Sessions, durable runs), Loops, schedules, tasks,
  application data from the SDK.
- `polpo-channels`: WhatsApp, Telegram, Slack, and Discord Channels.
- `polpo-integrations`: Connections, OAuth, MCP servers, custom tools.
- `polpo-react`: React hooks and chat UI.
