# Contract Version

verified-against: `0.17.2`
reviewed: 2026-10-14

This skill was reviewed against the Polpo OSS `0.17.2` source. Checked: `defineTool` fields (`timeoutMs`, `connections`, `bindingsSchema`, `serverBindings`), the `polpo connections` and `polpo tools` CLI commands, `ctx.data`, and the self-hosted `connectService` option.

## Minimum Versions

| Feature | Minimum Polpo version |
|---|---|
| `ctx.data` in custom tools | `0.15.144` |
| Connector protocol/authentication model, customer OAuth clients, MCP OAuth configurations, gateway and direct slots | `0.16.0` |

## If The Installed Version Differs

1. Check `polpo --version`, the installed `@polpo-ai/*` versions, and `polpo <command> --help`.
2. Prefer what the installed types, schemas, and help output say over this skill.
3. Do not add fields this skill mentions if the installed schema rejects them.
4. Tell the user when a version gap affects what they asked for, and name the minimum version.

Release history and earlier verification notes are kept in `CHANGELOG.md` in the
`lumea-labs/polpo-skills` repository. That file is not part of the installed skill.
