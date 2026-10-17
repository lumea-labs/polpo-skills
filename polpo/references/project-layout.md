# Project Layout

Polpo project layout version 2 stores one file or directory per resource.

```text
.polpo/
|-- project.json              # {"schemaVersion": 2, "project": "...", "settings": {...}}
|-- agents/
|   `-- support/
|       |-- agent.json        # authored agent configuration
|       `-- instructions.md   # system instructions (plain Markdown)
|-- teams/
|   `-- customer-success.json
|-- loops/
|   `-- resolve-ticket.ts     # or .json
|-- hooks/
|   `-- guardrails.json       # runtime hook pack
|-- skills/
|   `-- support-playbook/     # complete skill bundle
|       |-- SKILL.md
|       `-- references/
|-- skills.lock.json          # written by `polpo skills`; do not hand-edit
|-- tools/
|   `-- lookup-order.ts       # custom tools (defineTool)
`-- schedules/
    `-- nightly-report.json
```

Other entries you may find: `missions/`, `playbooks/`, `tasks/`, `sessions/`, `avatars/`,
`vault.enc` (encrypted credentials), `memory.md` and `memory/<agent>.md` (legacy static memory),
`skills-index.json` (runtime tags and categories for skills), and `.env` (local provider keys,
never committed). `polpo deploy` does not upload `vault.enc`, memory files, or `.env`.

## project.json

`projectId` and `projectSlug` link the directory to a Cloud project; `polpo create` and
`polpo link` write them. No environment is stored here: Development or Production is chosen per
command. Runtime behaviour lives under `settings`, for example
`"storage": "postgres"`, `"guardrails": {"policyPack": "standard"}`, or
`"contextTrust": "enforce"`.

## Agents

The directory name is the agent name. `instructions.md` becomes the agent's system prompt.
`agent.json` therefore must not contain `name`, `systemPrompt`, or `createdAt`; the runtime
derives or assigns them.

```json
{
  "role": "Customer support specialist",
  "model": "openai/gpt-5",
  "allowedTools": ["http_fetch"],
  "skills": ["support-playbook"]
}
```

Get valid model IDs from `polpo models list`. Keep secrets, short-lived grants, and tenant
identity out of both files. Field reference: `polpo-agents`.

## Teams

`.polpo/teams/<team>.json` holds team metadata. The filename is the team name. Membership comes
from each agent's `team` field, so do not add `name` or `agents` to the team file.

## Loops

Project Loops live in `.polpo/loops/` as TypeScript (`defineProjectLoop`) or JSON. Agents may run
only the Loops listed in their `assignedLoops`. Check them with `polpo loops validate`. Do not
add the legacy inline `loops` or `pipeline` agent fields to new projects.

## Skills

A skill is a whole directory, not only `SKILL.md`. Keep `references/`, `scripts/`, `assets/`,
and binary files together. Install with `polpo skills add` so the lockfile records where each
skill came from.

## Hook Packs

`.polpo/hooks/<name>.json` holds one pack whose `name` equals the file name. Agents opt in with
a `hooks` array in `agent.json`. Packs are trusted project policy, so never put credentials in
them; use a Connection for authenticated HTTP handlers. Details: [runtime-hooks.md](runtime-hooks.md).

## Custom Tools And Schedules

Each `.polpo/tools/*.ts` file exports one `defineTool(...)`; local imports are bundled on deploy
(see `polpo-integrations`). Each `.polpo/schedules/*.json` file is one schedule; deploy validates
the referenced agents and Loops before creating anything (see `polpo-runtime`).

## Legacy Layout

Old projects use `.polpo/polpo.json` and `.polpo/agents.json`. Do not create these files. Convert
with `polpo migrate --dry-run`, review, then `polpo migrate`. Afterwards check that agent names,
instructions, teams, Loop references, skill assignments, and tool paths are unchanged.
