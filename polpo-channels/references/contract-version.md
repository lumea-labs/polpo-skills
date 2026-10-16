# Contract Version

Verified on 2026-08-24 against Polpo OSS `0.15.109`, `@polpo-ai/channels`, the official Chat SDK
adapters pinned by that release, the Channel management service, CLI provisioning, trusted
identity resolver, server-side client tool continuation, and WhatsApp provider extensions.

Provider APIs and Chat SDK adapters evolve independently. Re-check capability and receipt support
before promising native behavior.

## OSS contract recheck — 2026-10-09

Rechecked the referenced OSS contracts against `0.15.143` source and the
`0.15.144` release. All release packages were verified in the npm registry on
2026-10-09. The Channel package currently pins Chat SDK and its official
adapters to `4.37.0`.

Verified public Channel/runtime/management exports, response segmentation fields,
the trusted identity and client-tool conversation bridge interfaces, and the CLI
provider/list/get/add/update/test/template/remove/setup/Route commands with their
documented options. Evidence: `packages/channels/src/index.ts`,
`packages/server/src/channels/conversation-bridge.ts` and
`packages/cli/src/commands/cloud/channels.ts`; 95 Channel package tests and 8 CLI
Channel tests passed, and built CLI `channels --help` matched the reference.

This is an OSS contract recheck. It does not certify live provider authorization,
media delivery, Cloud deployment, or new receipt support. Conversation-bridge
interfaces were reviewed from source; the passing test evidence above covers
the Channel package and CLI.


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
Cloud canary. Environment-aware client and CLI targeting is published. Managed
provisioning and isolated Channel state remain rollout-gated per project; do not
infer Cloud availability until that project's migration is complete.

## Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.7`. Channel-originated
agent turns participate in the same Runtime Hooks lifecycle as direct chat.
No new Channel configuration field or React transport contract is required;
managed Cloud availability remains rollout-dependent.
