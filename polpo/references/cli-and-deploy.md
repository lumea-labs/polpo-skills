# CLI And Deploy

Use `polpo --help` and command-specific help as the final authority for the installed version.

## Bootstrap

```bash
polpo login
polpo whoami
polpo create
polpo link
```

`create` provisions or links a project and initializes the current `.polpo/` layout. `link`
associates an existing local repository with an existing project, writes the project reference,
and pulls the Cloud resources into `.polpo/`. In interactive mode it resolves local conflicts;
`--yes` uses non-interactive defaults and forces the pull. Inspect or commit valuable local
`.polpo/` changes before linking.

## Resource Workflow

```bash
polpo deploy
polpo cloud-logs
polpo projects list
```

`polpo link` performs the supported cloud-to-local resource pull while linking an existing
project. There is no standalone public `polpo pull` command in this release.

Before deployment:

1. validate JSON and TypeScript resource definitions;
2. verify every agent, skill, tool, Connection, and Loop reference;
3. ensure generated or local-only files are excluded;
4. preserve the dependency order: tools and skills before Loops or agents that reference them;
5. require a non-zero exit when any resource fails.

Do not interpret a partially created resource as a successful deploy. A repeated identical
deploy may be a useful idempotency test, but it is not a repair strategy.

## Skills

```bash
polpo skills list
polpo skills add owner/repository --skill frontend-design --agent builder
polpo skills assign frontend-design --agent builder
polpo skills unassign frontend-design --agent builder
polpo skills update frontend-design
polpo skills remove frontend-design
```

`skills add` installs the complete selected bundle into `.polpo/skills`, updates the lockfile,
and can assign it to an agent. Deployment must upload the complete relative dependency graph,
including references, scripts, assets, and binary resources.

## Failure Handling

- Authentication or membership failures are not project absence. Preserve local files and ask
  the operator to select the intended organization or project.
- Unknown tool/skill/Loop references must fail before partial publication where possible.
- Provider provisioning can legitimately remain pending, but the CLI must surface the provider
  action and setup URL instead of reporting the resource active.
- Database reconciliation and package release are separate from project deployment. Run them
  only when the changed contract requires them.
