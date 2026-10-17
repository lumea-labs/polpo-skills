# Contract Version

verified-against: `0.18.9`
reviewed: 2026-10-17

This skill was first reviewed against the Polpo OSS `0.17.2` source. Checked: `AgentConfig` fields (`model`, `allowedTools`, `toolLoading`, `skills`, `assignedLoops`, `mcpServers`, `chat`, `sandbox`, routers), runtime skill tools, the nine `database_*` tools, Memory and Knowledge routes, and the `volumes` and `memory candidates` CLI groups. Re-checked on 0.18.9: `hooks` and `steering` agent fields and the steering policy schema.

## Minimum Versions

| Feature | Minimum Polpo version |
|---|---|
| Application database tools and grants | `0.15.144` |
| Loop completion suggestions, up to five items | `0.16.1` |
| Action suggestions (links, postbacks) | `0.17.0` |
| `hooks` field | `0.18.8` |
| `steering` policy | `0.18.9` |

## If The Installed Version Differs

1. Check `polpo --version`, the installed `@polpo-ai/*` versions, and `polpo <command> --help`.
2. Prefer what the installed types, schemas, and help output say over this skill.
3. Do not add fields this skill mentions if the installed schema rejects them.
4. Tell the user when a version gap affects what they asked for, and name the minimum version.

Release history and earlier verification notes are kept in `CHANGELOG.md` in the
`lumea-labs/polpo-skills` repository. That file is not part of the installed skill.
