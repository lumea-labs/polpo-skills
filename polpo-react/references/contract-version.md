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

The action suggestion contract is published in OSS `0.17.0` (OSS PR #449).
It adds a message/action TypeScript union and caller-authored links/postbacks;
use it only after the package and serving host are upgraded. Runtime and React
references describe the contract; CLI/agent-directory settings are unchanged.
The Channel buttons/list contract is published in OSS `0.17.1` (OSS PR #450).
Shared-queue selection admission across replicas is published in `0.17.2`
(OSS PR #451); keep hosted Channel suggestions disabled until every worker is upgraded.
Managed host wiring and real-device acceptance remain separate from the OSS
package release. Shared Chat/Playground rendering is still a separate UI contract.
These notes do not change verification dates for unrelated features above.


## Project environments release contract

Reconciled on **2026-10-15** against published OSS `0.17.3` and the deployed
Cloud canary. Environment-aware client, React provider and CLI targeting are
published. Managed provisioning and dashboard selection remain rollout-gated per
project; do not infer Cloud availability until that project's migration is complete.

## Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.8`. Runtime Hooks are
server-side project policy and do not add a React chat frame or client-side
execution API in this release. Existing streaming, Session and interaction
contracts remain unchanged; managed Cloud availability is rollout-dependent.

## Runtime Steering release contract

OSS `0.18.9` exposes steering through the SDK and authenticated Runs API. It adds
no React-side execution authority; applications render receipt outcomes and keep
the server authoritative when a local view of the safe boundary is stale.
