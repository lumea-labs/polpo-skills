# Contract Version

Verified on 2026-08-24 against Polpo OSS `0.15.109`, current `@polpo-ai/react` `useChat`,
`@polpo-ai/sdk` durable delivery and continuation, and `@polpo-ai/chat` `0.11.1` presentational
components.

The React runtime and UI component packages release independently. Inspect installed component
props before copying an example from a different package version.

## Runtime contract recheck — 2026-10-09

Rechecked the OSS runtime references against `0.15.143` source and the `0.15.144`
release. All release packages were verified in the npm registry on 2026-10-09.
The checked contracts are `PolpoProvider` (`baseUrl`, `apiPrefix`, custom `fetch`,
`autoConnect`), `useChat` options/return types, durable detach/cancel, Session
versioned tool continuation, per-message skills and runtime suggestions.

Evidence: `packages/react-sdk/src/provider/polpo-provider.tsx`,
`packages/react-sdk/src/hooks/use-chat.ts`, the public exports in
`packages/react-sdk/src/index.ts`, and 16 passing `use-chat`/`use-sessions` tests.
The older verification above still applies to independently released
`@polpo-ai/chat` UI props, theming, `@polpo-ai/ui` and `create-polpo-app`; this
runtime recheck does not claim those external packages were retested or released.


## Chat suggestions release tracking

OSS `0.16.2` is published. It includes the `0.16.1` Loop completion,
request-context and five-item extension, plus a 15-second auxiliary deadline and
agent reasoning precedence (OSS PRs #447/#448).

The action suggestion contract targets `0.17.0` (OSS PR #449, release pending).
It adds a message/action TypeScript union and caller-authored links/postbacks;
use it only after the package and serving host are upgraded. Runtime and React
references describe the contract; CLI/agent-directory settings are unchanged.
Channel buttons/lists and shared Chat/Playground rendering are separate work.
These notes do not change verification dates for unrelated features above.
