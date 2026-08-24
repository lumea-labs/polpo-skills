---
name: polpo
description: Set up, inspect, link, and deploy Polpo projects using the current .polpo directory layout and CLI. Use for project bootstrap, project files, cloud linking, deployment, or deciding whether behavior belongs to Polpo OSS or Polpo Cloud. For agent design, runtime calls, Channels, integrations, or React UI, use the corresponding specialized Polpo skill.
---

# Polpo Projects

Treat the checked-out project and the installed CLI as authoritative. Do not recreate legacy
`.polpo/polpo.json` or `.polpo/agents.json` layouts except when explicitly migrating them.

## Workflow

1. Inspect the repository, `.polpo/`, `package.json`, and the installed `polpo` CLI version.
2. Preserve an existing linked project. Create or link only when the user requests it or no
   project exists.
3. Author resources in layout v2: project metadata, one directory per agent, project Loop
   definitions, teams, skills, and the skill lockfile.
4. Validate locally before deployment. Resolve unknown references and packaging failures rather
   than relying on a second identical deploy.
5. Deploy through the CLI or supported workflow. Never place provider secrets in project files.
6. Report the project, resources changed, validation performed, and whether anything still
   requires Cloud provisioning or rollout.

## Project Boundaries

- OSS owns portable contracts, schemas, runtime behavior, SDKs, CLI behavior, and self-hosted
  adapters.
- Cloud owns managed tenancy, billing, rollout, hosted storage, provider automation, secure
  credential custody, and managed reconciliation.
- A Cloud feature should consume an OSS primitive when the behavior is generally useful to a
  self-hosted runtime. Do not model portable runtime behavior as dashboard-only configuration.

## References

- Read [references/project-layout.md](references/project-layout.md) before creating or migrating
  `.polpo/` files.
- Read [references/cli-and-deploy.md](references/cli-and-deploy.md) for bootstrap, linking,
  validation, deployment, pull, skills, and failure semantics.
- Read [references/platform-boundaries.md](references/platform-boundaries.md) when deciding OSS
  versus Cloud ownership or diagnosing managed-only behavior.
- Read [references/contract-version.md](references/contract-version.md) before relying on exact
  fields or commands in a different Polpo release.

## Specialized Skills

- `polpo-agents`: agent definitions, models, policies, skills, memory, and sandbox defaults.
- `polpo-runtime`: completions, Sessions, durable runs, Project Loops, steering, and schedules.
- `polpo-channels`: messaging providers, provisioning, routing, media, and trusted identity.
- `polpo-integrations`: Connections, custom tools, hidden bindings, MCP, and OAuth.
- `polpo-react`: React hooks, chat UI, durable reconnect, interactions, and client tools.
