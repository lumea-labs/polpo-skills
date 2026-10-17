# Contract Version

verified-against: `0.17.2`
reviewed: 2026-10-14

This skill was reviewed against the Polpo OSS `0.17.2` source. Checked: `PolpoProvider` props (`baseUrl`, `apiPrefix`, `fetch`, `autoConnect`), `useChat` options and return values (`durable`, `status`, `continueToolResult`, `suggestions`, `detach`, `cancel`), and `polpo create --template`. The separately released `@polpo-ai/chat`, `@polpo-ai/ui`, and `create-polpo-app` packages were not re-checked; their props were last checked against `@polpo-ai/chat` `0.11.1`.

## Minimum Versions

| Feature | Minimum Polpo version |
|---|---|
| Durable `useChat`, versioned tool continuation | `0.15.109` (earliest checked) |
| Loop completion suggestions | `0.16.1` |
| Action suggestions (`ChatSuggestion` union) | `0.17.0` |

## If The Installed Version Differs

1. Check `polpo --version`, the installed `@polpo-ai/*` versions, and `polpo <command> --help`.
2. Prefer what the installed types, schemas, and help output say over this skill.
3. Do not add fields this skill mentions if the installed schema rejects them.
4. Tell the user when a version gap affects what they asked for, and name the minimum version.

Release history and earlier verification notes are kept in `CHANGELOG.md` in the
`lumea-labs/polpo-skills` repository. That file is not part of the installed skill.
