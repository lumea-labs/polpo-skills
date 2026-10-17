# Contract Version

verified-against: `0.17.2`
reviewed: 2026-10-14

This skill was reviewed against the Polpo OSS `0.17.2` source. Checked: `PolpoClient` methods (`chatCompletions`, `chatCompletionsStream`, `continueWithToolResult`, `steerRun`, `data`, `createData`), `@polpo-ai/core/loop-code` exports, schedule routes and timing kinds, durable run delivery, and project `settings.guardrails` / `settings.contextTrust`.

## Minimum Versions

| Feature | Minimum Polpo version |
|---|---|
| Application Data via SDK/API | `0.15.144` |
| Loop completion suggestions and request context | `0.16.1` |
| 15-second suggestion deadline | `0.16.2` |
| Action suggestions (links, postbacks) | `0.17.0` |

## If The Installed Version Differs

1. Check `polpo --version`, the installed `@polpo-ai/*` versions, and `polpo <command> --help`.
2. Prefer what the installed types, schemas, and help output say over this skill.
3. Do not add fields this skill mentions if the installed schema rejects them.
4. Tell the user when a version gap affects what they asked for, and name the minimum version.

Release history and earlier verification notes are kept in `CHANGELOG.md` in the
`lumea-labs/polpo-skills` repository. That file is not part of the installed skill.
