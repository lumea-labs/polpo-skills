# Contract Version

verified-against: `0.18.9`
reviewed: 2026-10-17

This skill was first reviewed against the Polpo OSS `0.17.2` source. Checked: `PolpoClient` methods (`chatCompletions`, `chatCompletionsStream`, `continueWithToolResult`, `steerRun`, `data`, `createData`), `@polpo-ai/core/loop-code` exports, schedule routes and timing kinds, durable run delivery, and project `settings.guardrails` / `settings.contextTrust`. Re-checked on 0.18.9: `environment` client option, steering receipts and policy precedence, and runtime hook dispatch in chat and Loops.

## Minimum Versions

| Feature | Minimum Polpo version |
|---|---|
| Application Data via SDK/API | `0.15.144` |
| Loop completion suggestions and request context | `0.16.1` |
| 15-second suggestion deadline | `0.16.2` |
| Action suggestions (links, postbacks) | `0.17.0` |
| SDK `environment` option | `0.17.3` |
| Runtime hooks during runs | `0.18.8` |
| Steering receipts and policy (`getSteeringReceipt`) | `0.18.9` |

## If The Installed Version Differs

1. Check `polpo --version`, the installed `@polpo-ai/*` versions, and `polpo <command> --help`.
2. Prefer what the installed types, schemas, and help output say over this skill.
3. Do not add fields this skill mentions if the installed schema rejects them.
4. Tell the user when a version gap affects what they asked for, and name the minimum version.

Release history and earlier verification notes are kept in `CHANGELOG.md` in the
`lumea-labs/polpo-skills` repository. That file is not part of the installed skill.
