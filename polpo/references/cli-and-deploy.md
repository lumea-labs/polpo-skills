# CLI And Deploy

The CLI is `@polpo-ai/cli` (binary `polpo`). Run `polpo <group> --help` before using a flag you
have not seen in help output for the installed version. Most groups accept `--json`; use it
when you need to parse the output. Project commands accept `--prod` / `--env production` and
otherwise target Development (see [project-environments.md](project-environments.md)).

## Command Map

| Group | Commands | Use for |
|---|---|---|
| Account | `login`, `logout`, `whoami`, `orgs list` | Device-code sign-in; stores `~/.polpo/credentials.json` |
| Project | `create`, `link --project-id <id>`, `projects list\|create`, `cloud-status`, `cloud-logs [--follow]` | Creating, linking, inspecting a Cloud project |
| Layout | `migrate [--dry-run]` | Converting a legacy `.polpo/` layout |
| Deploy | `deploy [-y] [-f] [--include-tasks] [--include-sessions] [--all]` | Upload `.polpo/` resources |
| Loops | `loops validate`, `loops compile [file] [-o out.json]` | Checking Loops locally before deploy |
| Hooks | `hooks validate`, `hooks list [--local]`, `hooks capabilities` | Runtime hook packs (see [runtime-hooks.md](runtime-hooks.md)) |
| Runs | `runs steer <run-id> --message "..." [--mode steer\|follow_up] [--locale it-IT]`, `runs steering get <run-id> <message-id>`, `runs abort <run-id>` | Steering or stopping an active run |
| Diagnostics | `runtime inspect <run-id>`, `runtime export-replay <run-id> -o file` | Run diagnostics, where the host supports them |
| Tools | `tools push <file>`, `tools list`, `tools get <name>`, `tools run <name> --args '{...}'`, `tools rm <name>` | Custom tools (beta) |
| Skills | `skills list\|add\|assign\|unassign\|update\|remove` | Runtime skills for Polpo agents |
| Models | `models list [--provider p] [--plain]`, `byok set\|list\|remove <provider>` | Picking model IDs; bring-your-own provider keys |
| Integrations | `connections ...`, `channels ...` | See `polpo-integrations` and `polpo-channels` |
| Data | `data list\|describe\|create\|migrate\|query\|...` | See [databases.md](databases.md) |
| Sandboxes | `volumes list\|get\|create\|update\|remove`, `volumes grants list\|set\|revoke --agent <name>` | Persistent sandbox volumes |
| Memory | `memory candidates list\|get\|audit\|approve\|reject\|apply --agent <a> --user <id>` | Reviewing automatically learned Memory |
| Coding agents | `install [--client claude-code,cursor] [--scope global\|project]` | Installing this skill pack (requires sign-in) |
| CLI | `update [--check]` | Upgrading the CLI |

There is no `init`, `dev`, `serve`, or `pull` command. `polpo link` is the only way to pull Cloud
resources into `.polpo/`.

## Create And Link

`polpo create` options: `--name`, `--org-id`, `--template empty|chat|chat-widget|multi-agent`,
`--scenario none|data-analyst|marketing-researcher|product-manager` (seed example agents),
`--skills global|project|skip` (installs this pack for coding agents), `-y`.

`polpo link --project-id <uuid>` writes the project reference and pulls Cloud resources into
`.polpo/`. Interactive mode asks about local conflicts; `--yes` overwrites with Cloud state. Ask
the user to commit or back up local `.polpo/` changes before linking.

## Deploy

`polpo deploy` scans `.polpo/` and deploys in this order: teams, skills, hook packs, custom
tools, Loops, agents, missions, playbooks, schedules, avatars, and then tasks or sessions only
when `--include-tasks`, `--include-sessions`, or `--all` is passed. It does not upload memory,
vault credentials, or model keys; set those per environment. Hook packs are always overwritten
(no conflict prompt), one invalid pack fails the hooks step, and removing a pack locally does not
delete it remotely. `-f` overwrites
conflicting Cloud resources without asking; use it only when the user wants local files to win.

Before deploying:

1. Run `polpo loops validate` and `polpo hooks validate` if those folders exist.
2. Confirm the target: Development by default, `--prod` only when the user asked for Production.
3. Check that every agent's `skills`, `hooks`, `allowedTools`, `assignedLoops`, and model
   profile refers to something that exists locally or already in the project.
4. Make sure no file under `.polpo/` contains a secret.

Read the summary at the end. Any failed resource means the deploy is incomplete, even if the
others succeeded. Fix the cause and redeploy; an identical second attempt is not a repair.

Deploy does not run database migrations, provision Channels, or create Connections. Those have
their own commands.

## Runtime Skills

```bash
polpo skills add owner/repository --skill frontend-design --agent support
polpo skills add ./my-skill --agent support
polpo skills list
polpo skills update --all
polpo skills unassign frontend-design --agent support
polpo skills remove frontend-design
```

`skills add` copies the whole bundle (SKILL.md, references, scripts, assets) into
`.polpo/skills/<name>/`, adds the name to the chosen agents' `skills` arrays, and records the
source in `.polpo/skills.lock.json`. Nothing is uploaded until `polpo deploy` or `--deploy`.

These are skills for Polpo agents. They are separate from this pack, which is installed into
coding agents with `polpo install`.

## Failure Handling

- An authentication or membership error does not mean the project is gone. Keep local files and
  ask the user to check `polpo whoami` and the selected organization.
- A Channel or Connection can stay pending while the provider waits for the user. Show the setup
  URL or action the CLI prints instead of reporting it as active.
