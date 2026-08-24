# Project Layout

Polpo project layout version 2 uses resource directories rather than aggregate agent files.

```text
.polpo/
|-- project.json
|-- agents/
|   `-- support/
|       |-- agent.json
|       `-- instructions.md
|-- teams/
|   `-- customer-success.json
|-- loops/
|   `-- resolve-ticket.ts
|-- skills/
|   `-- support-playbook/
|       |-- SKILL.md
|       `-- references/
`-- skills.lock.json
```

## Agent Directories

The directory name is the agent name. `agent.json` contains authored configuration only.
Do not include `name`, `systemPrompt`, or `createdAt`; they are respectively derived from the
directory, loaded from `instructions.md`, or assigned by the runtime.

```json
{
  "role": "Customer support specialist",
  "model": "openai/gpt-5-mini",
  "allowedTools": ["http_fetch"],
  "skills": ["support-playbook"]
}
```

`instructions.md` contains the agent instructions as plain Markdown. Keep operational secrets,
short-lived grants, and tenant identity out of both files.

## Teams

Each `.polpo/teams/<team>.json` file defines authored team fields. The filename supplies the
team name and agent membership is derived from each agent's `team` field. Do not add `name` or
`agents` to the team file.

## Loops

Project Loops live under `.polpo/loops/` and may be JSON or TypeScript according to the current
CLI/runtime contract. Agents reference allowed Loop names through `assignedLoops`. Keep Loop
definitions project-level; do not add new legacy inline `loops` or `pipeline` fields unless
maintaining an existing project.

## Skills

Skills are complete bundles, not only `SKILL.md`. Preserve `references/`, `scripts/`, `assets/`,
and binary files. `.polpo/skills.lock.json` records installed sources and revisions; do not hand
edit it unless repairing a documented migration.

## Legacy Migration

The CLI can recognize old `.polpo/polpo.json` and `.polpo/agents.json` for migration. Treat them
as input to a migration, not as the target layout. After conversion, validate that agent names,
instructions, teams, Loop references, skill assignments, and custom tool paths are unchanged.
