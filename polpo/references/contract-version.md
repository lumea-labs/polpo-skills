# Contract Version

verified-against: `0.18.9`
reviewed: 2026-10-17

This skill was first reviewed against the Polpo OSS `0.17.2` source. Checked: CLI command groups and flags, deploy order, project layout v2, self-hosted server entrypoint and environment, Docker Compose example, SDK API prefix selection, and the OSS/Cloud package split. Re-checked on 0.18.9: `--env`/`--prod` handling, `hooks` and `runs` commands, deploy order without memory or vault, hook pack validation, and self-hosted environment binding.

## Minimum Versions

| Feature | Minimum Polpo version |
|---|---|
| Project layout v2 (`agents/<name>/agent.json`) | `0.15.109` (earliest checked) |
| Application databases (`polpo data`) | `0.15.144` |
| Connections CLI (`connections setup-session`, gateway mode) | `0.16.0` |
| Project environments (`--prod`, `--env`) | `0.17.3` |
| Runtime hook packs (`polpo hooks`) | `0.18.8` |
| Steering receipts (`polpo runs`) | `0.18.9` |

## If The Installed Version Differs

1. Check `polpo --version`, the installed `@polpo-ai/*` versions, and `polpo <command> --help`.
2. Prefer what the installed types, schemas, and help output say over this skill.
3. Do not add fields this skill mentions if the installed schema rejects them.
4. Tell the user when a version gap affects what they asked for, and name the minimum version.

Release history and earlier verification notes are kept in `CHANGELOG.md` in the
`lumea-labs/polpo-skills` repository. That file is not part of the installed skill.
