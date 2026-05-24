# Teams

Teams group agents by function. Each agent belongs to exactly one team. Teams are surfaced in the dashboard, in agent prompts (peer context), and in mission team assignments.

## File layout

`.polpo/teams.json` — array of team objects:

```json
[
  { "name": "default",    "description": "Default team" },
  { "name": "engineering","description": "Backend engineers and code reviewers" },
  { "name": "product",    "description": "Product managers and designers" }
]
```

Schema (`AddTeamSchema`):
```typescript
{ name: string, description?: string }
```

## Assigning agents to teams

In `agents.json`, each entry is a `{ agent, teamName }` wrapper:

```json
[
  {
    "agent": { "name": "pm", "role": "Product manager", "model": "..." },
    "teamName": "product"
  },
  {
    "agent": { "name": "engineer", "role": "Backend engineer", "model": "..." },
    "teamName": "engineering"
  }
]
```

If `teamName` is omitted, the agent lands in `"default"`.

## API endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/v1/agents/teams` | — | `Team[]` (with member agents) |
| GET | `/v1/agents/team?name=<name>` | — | single `Team` or null |
| POST | `/v1/agents/teams` | `{name, description?}` | `{added: true}` |
| PATCH | `/v1/agents/team` | `{oldName, name, description?}` | renamed `Team` |
| DELETE | `/v1/agents/teams/{name}` | — | `{removed: true}` |

**Path quirk for rename**: the PATCH route is `/v1/agents/team` (singular `/team`), not `/v1/agents/teams/{name}`. The team to rename is identified by `oldName` in the body.

### Examples

```bash
# List teams
curl -H "Authorization: Bearer $POLPO_API_KEY" \
  https://my-project.polpo.cloud/v1/agents/teams

# Create a team
curl -X POST https://my-project.polpo.cloud/v1/agents/teams \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"data-science","description":"ML engineers and analysts"}'

# Rename
curl -X PATCH https://my-project.polpo.cloud/v1/agents/team \
  -H "Authorization: Bearer $POLPO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"oldName":"data-science","name":"ml-engineering","description":"ML team"}'

# Delete (also unassigns its agents back to default)
curl -X DELETE https://my-project.polpo.cloud/v1/agents/teams/data-science \
  -H "Authorization: Bearer $POLPO_API_KEY"
```

## Worked example — multi-agent

```json
// teams.json
[
  { "name": "engineering", "description": "Engineering team — builds and reviews code" },
  { "name": "product",     "description": "Product team — plans features and writes specs" }
]

// agents.json
[
  {
    "agent": {
      "name": "product-manager",
      "role": "Product manager — writes specs"
    },
    "teamName": "product"
  },
  {
    "agent": {
      "name": "backend-engineer",
      "role": "Backend engineer — implements specs",
      "reportsTo": "product-manager"
    },
    "teamName": "engineering"
  },
  {
    "agent": {
      "name": "reviewer",
      "role": "Code reviewer — quality gate",
      "reportsTo": "backend-engineer"
    },
    "teamName": "engineering"
  }
]
```

The `reportsTo` field is metadata (escalation hint for the agent) — Polpo doesn't enforce it. The dashboard surfaces it in team views.

## Common pitfalls

- **Wrong path for rename** — use `PATCH /v1/agents/team` (singular), not `/v1/agents/teams/{name}`.
- **Team name as identifier** — teams are identified by `name`, not UUID. To rename, use the rename endpoint above (it updates references too).
- **Deleting a team with agents** — agents are reassigned to `default`. Make sure `default` exists.
- **Duplicate team names** — `name` is the primary key. Re-POSTing a team with an existing name will be rejected.
