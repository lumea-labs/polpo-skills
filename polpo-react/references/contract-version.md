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
