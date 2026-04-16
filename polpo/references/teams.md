# Teams

Named groups of agents. Defined in `.polpo/teams.json`, agents reference teams via `teamName` in `agents.json`.

## teams.json Format

```json
[
  { "name": "default", "description": "Default team" },
  { "name": "qa-team", "description": "Quality assurance specialists" }
]
```

## Linking Agents to Teams

In `agents.json`, each entry wraps an agent with its team:

```json
[
  { "agent": { "name": "coder", ... }, "teamName": "default" },
  { "agent": { "name": "reviewer", ... }, "teamName": "qa-team" }
]
```

## Multi-Team Architecture

- One project can have N teams
- Agents are assigned to exactly one team
- Teams enable organizational grouping (frontend-team, backend-team, qa-team)
- Orchestrator can route tasks to agents based on team

## Volatile Agents

Agents with `volatile: true` are temporary — created for a mission, auto-deleted after:

```json
{ "agent": { "name": "temp-analyst", "volatile": true, "missionGroup": "q4-report" }, "teamName": "default" }
```

## Helpers (source code)

- `getAllAgents(teams)` — flatten all agents across teams
- `findAgent(teams, name)` — search by name
- `findAgentTeam(teams, name)` — find containing team

Source: `packages/core/src/types.ts`
