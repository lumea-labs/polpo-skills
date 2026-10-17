# Contract Version

verified-against: `0.17.2`
reviewed: 2026-10-14

This skill was reviewed against the Polpo OSS `0.17.2` source. Checked: `@polpo-ai/channels` exports (`ChannelRuntime`, management service, WhatsApp suggestion adapter), the `polpo channels` CLI commands, and the self-hosted `channels` server option.

## Minimum Versions

| Feature | Minimum Polpo version |
|---|---|
| Channel management service and CLI | `0.15.109` (earliest checked) |
| Channel suggestion buttons and lists | `0.17.1` |
| Suggestions across several replicas (shared queue admission) | `0.17.2` |

## If The Installed Version Differs

1. Check `polpo --version`, the installed `@polpo-ai/*` versions, and `polpo <command> --help`.
2. Prefer what the installed types, schemas, and help output say over this skill.
3. Do not add fields this skill mentions if the installed schema rejects them.
4. Tell the user when a version gap affects what they asked for, and name the minimum version.

Release history and earlier verification notes are kept in `CHANGELOG.md` in the
`lumea-labs/polpo-skills` repository. That file is not part of the installed skill.
