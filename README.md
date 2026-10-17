# Polpo Skills

Agent skills that teach coding agents (Claude Code, Cursor, Codex, Copilot, and others) how to
build with [Polpo](https://github.com/lumea-labs/polpo), on Polpo Cloud or self-hosted.

Install them with the Polpo CLI:

```bash
npx @polpo-ai/cli install            # global; add --client claude-code,cursor or --scope project
```

| Skill | Use it for |
|---|---|
| `polpo` | Project setup, CLI, deploy, self-hosting, OSS versus Cloud. Routes to the others. |
| `polpo-agents` | Agent definitions, models, tool permissions, skills, Memory, Knowledge, sandboxes. |
| `polpo-runtime` | Calling agents from code: SDK, Sessions, durable runs, Loops, schedules, data. |
| `polpo-integrations` | Custom tools, Connections, OAuth, MCP. |
| `polpo-channels` | WhatsApp, Telegram, Slack, Discord. |
| `polpo-react` | React hooks and chat UI. |

These are coding-agent skills. Runtime skills for Polpo agents are installed with
`polpo skills add` and live in a project's `.polpo/skills/`.

## Maintaining The Pack

- Write for developers who use Polpo. Requirements for people building their own host belong in
  the clearly labelled host references (`polpo-runtime/references/custom-hosts.md`,
  `polpo-channels/references/self-hosted-channels.md`).
- Keep `SKILL.md` short and put detail in `references/`. Every reference must be linked from its
  `SKILL.md`.
- Each `references/contract-version.md` starts with `verified-against: \`x.y.z\``. When Polpo
  releases, re-check the skills against that version and bump the line. CI fails when it lags
  behind the OSS `packages/core` version.
- Release notes and verification history go in `CHANGELOG.md`, not inside skills.
- Check every command, field, and default against the OSS source before writing it down.
- `evals/evals.json` holds realistic test prompts. Use them with the skill-creator workflow when
  changing a skill or its description.

Validate locally with a checkout of `lumea-labs/polpo` next to this repository:

```bash
node scripts/validate-skills.mjs          # or POLPO_OSS_ROOT=/path/to/polpo node scripts/...
```
