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
