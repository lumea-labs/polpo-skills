# Changelog

Release notes and verification history for the Polpo skill pack. This file is for maintainers
of this repository. It is not inside any skill directory, so coding agents do not load it.

## 2026-10-17: Rebase on main and rewrite of #11–#14 content

- Rebased the rewrite on top of #11–#14 and re-checked their topics against OSS `0.18.9`
  source instead of carrying the release notes over:
  - Project environments: rewritten as task guidance (`--prod`, keys, what deploy moves,
    SDK/React/Connect `environment`, self-hosted binding, legacy Live/Test projects).
  - Runtime Hooks: new authoring reference in `polpo` with the validated pack schema, which
    events honour decisions, handler fields, and which handlers work on the stock self-hosted
    server; shorter runtime and integration views.
  - Steering: receipts, policy precedence, CLI `runs` commands, and limits.
- Corrected facts found in source: the handler type is `http`, `command` handlers receive the
  event only through environment variables on the stock Node host, `ask`/`defer` block like
  `deny`, `turn:stop` data has no answer text, `polpo deploy` no longer uploads memory or vault,
  and the stock capabilities route lists the whole contract rather than configured adapters.
- `verified-against` is now `0.18.9`.

## 2026-10-14: Rewrite for Polpo users

- Rewrote the skills for developers who build on Polpo (Cloud or self-hosted) rather than for
  maintainers of the runtime. Host-implementation requirements moved into clearly labelled
  references (`polpo-runtime/references/custom-hosts.md`,
  `polpo-channels/references/self-hosted-channels.md`).
- Added a Cloud quickstart, a self-hosting reference, a feature availability table, and the
  missing CLI command groups (`loops`, `tools`, `volumes`, `byok`, `models`, `memory`,
  `migrate`, `cloud-status`).
- Rewrote every `description` so the skills trigger on `.polpo/` directories and `@polpo-ai/*`
  imports, not only on the word "Polpo".
- Replaced the duplicated release notes in each `references/contract-version.md` with a short
  `verified-against` line, a minimum-version table, and this changelog.
- Replaced customer-specific examples with neutral names.
- `scripts/validate-skills.mjs` now reads the structured `verified-against` line, checks the
  description length limit and SKILL.md size, and fails on release-tracking text inside skills.
- Added `evals/evals.json` with realistic test prompts for each skill.

## Earlier verification notes

The sections below are the `contract-version.md` files as they were before the rewrite.

### polpo


This skill set was verified on 2026-08-24 against Polpo OSS `0.15.109` and project layout
version `2`.

When the installed CLI or runtime differs:

1. inspect the installed package types and `polpo <command> --help`;
2. preserve backwards-compatible behavior unless the target explicitly requires migration;
3. do not invent fields from this reference if the installed schema rejects them;
4. report the version mismatch when it affects the requested operation.

The repository validation script treats this file as freshness metadata. Update it whenever a
public schema, command, route, or cross-surface invariant changes.

#### Application Data release contract

Data was verified on **2026-10-09** against the OSS and Cloud implementation
sources and the published OSS release `0.15.144`. All 17 release packages were
verified in the npm registry on 2026-10-09. Registry package `0.15.143` does not
contain Data, even though development artifacts previously used that version number.
The baseline above remains the verification level for unrelated features.

Before using Data, install `0.15.144` or a later version containing Data and inspect
the installed exports, API and `polpo data --help`. A package version alone does
not enable managed Cloud rollout or update a deployed host.

The contract includes typed records, SQL queries/mutations and migrations,
agent/custom-tool grants, the normal Polpo API key for application servers, and
the self-hosted dashboard's `/data` page. Cloud adds Neon provisioning, Live/Test
isolation, agent access administration and `polpo_databases_*` MCP/builder tools.
Reference sources are OSS `docs/data.md` and Cloud `docs/docs/platform/data.mdx`.


#### Chat suggestions release tracking

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

### polpo-agents


Verified on 2026-08-29 against Polpo OSS `0.15.128`, project layout version `2`, and the current
`AgentConfig`, model router, execution router, chat interaction, tool policy, sandbox, typed
Memory V2, and versioned Knowledge contracts.

For another version, inspect the installed schemas before authoring fields. Do not preserve
legacy aggregate agent files or `provider:model` identifiers merely because an old local skill
mentions them.

#### Application Data release contract

Data was verified on **2026-10-09** against the OSS and Cloud implementation
sources and the published OSS release `0.15.144`. All 17 release packages were
verified in the npm registry on 2026-10-09. Registry package `0.15.143` does not
contain Data, even though development artifacts previously used that version number.
The baseline above remains the verification level for unrelated features.

Before using Data, install `0.15.144` or a later version containing Data and inspect
the installed exports, API and `polpo data --help`. A package version alone does
not enable managed Cloud rollout or update a deployed host.

The contract includes typed records, SQL queries/mutations and migrations,
agent/custom-tool grants, the normal Polpo API key for application servers, and
the self-hosted dashboard's `/data` page. Cloud adds Neon provisioning, Live/Test
isolation, agent access administration and `polpo_databases_*` MCP/builder tools.
Reference sources are OSS `docs/data.md` and Cloud `docs/docs/platform/data.mdx`.


#### Chat suggestions release tracking

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

### polpo-runtime


Verified on 2026-08-29 against Polpo OSS `0.15.128`, `@polpo-ai/sdk`, `@polpo-ai/react`, core
Project Loop bindings/input projection, durable Run delivery, steering, structured output,
parallel server tools, Loop human metadata and logical groups, and production-tested Schedules
V2 lifecycle and idempotency behavior.

Exact provider/model capabilities may change independently. Validate the selected model's tool,
reasoning, modality, and JSON Schema support at runtime boundaries.

#### Application Data release contract

Data was verified on **2026-10-09** against the OSS and Cloud implementation
sources and the published OSS release `0.15.144`. All 17 release packages were
verified in the npm registry on 2026-10-09. Registry package `0.15.143` does not
contain Data, even though development artifacts previously used that version number.
The baseline above remains the verification level for unrelated features.

Before using Data, install `0.15.144` or a later version containing Data and inspect
the installed exports, API and `polpo data --help`. A package version alone does
not enable managed Cloud rollout or update a deployed host.

The contract includes typed records, SQL queries/mutations and migrations,
agent/custom-tool grants, the normal Polpo API key for application servers, and
the self-hosted dashboard's `/data` page. Cloud adds Neon provisioning, Live/Test
isolation, agent access administration and `polpo_databases_*` MCP/builder tools.
Reference sources are OSS `docs/data.md` and Cloud `docs/docs/platform/data.mdx`.


#### Chat suggestions release tracking

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

### polpo-channels


Verified on 2026-08-24 against Polpo OSS `0.15.109`, `@polpo-ai/channels`, the official Chat SDK
adapters pinned by that release, the Channel management service, CLI provisioning, trusted
identity resolver, server-side client tool continuation, and WhatsApp provider extensions.

Provider APIs and Chat SDK adapters evolve independently. Re-check capability and receipt support
before promising native behavior.

#### OSS contract recheck — 2026-10-09

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


#### Chat suggestions release tracking

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

### polpo-integrations


Verified on 2026-08-24 against Polpo OSS `0.15.109`, `@polpo-ai/tools`, `@polpo-ai/connect`, the
multi-file custom-tool artifact contract, immutable `ToolInvocationContext`, hidden server
bindings, logical Connection slots, and current CLI Connection management.

#### Application Data release contract

Data was verified on **2026-10-09** against the OSS and Cloud implementation
sources and the published OSS release `0.15.144`. All 17 release packages were
verified in the npm registry on 2026-10-09. Registry package `0.15.143` does not
contain Data, even though development artifacts previously used that version number.
The baseline above remains the verification level for unrelated features.

Before using Data, install `0.15.144` or a later version containing Data and inspect
the installed exports, API and `polpo data --help`. A package version alone does
not enable managed Cloud rollout or update a deployed host.

The contract includes typed records, SQL queries/mutations and migrations,
agent/custom-tool grants, the normal Polpo API key for application servers, and
the self-hosted dashboard's `/data` page. Cloud adds Neon provisioning, Live/Test
isolation, agent access administration and `polpo_databases_*` MCP/builder tools.
Reference sources are OSS `docs/data.md` and Cloud `docs/docs/platform/data.mdx`.

#### Connections release contract

Reconciled on **2026-10-12** against OSS tag `v0.16.1`, the actual CLI help and
Connection command tests. The Connector protocol/authentication model, reusable
MCP OAuth setup, embedded account consent, customer OAuth clients and gateway /
explicit direct-credential coexistence were released in OSS `0.16.0` (PR #445).
Cloud consumption PR #474 is merged. These are no longer unpublished `0.15.144`
development artifacts.

The CLI already provides these operations; this skills update documents them
without changing CLI or runtime behavior. Verify host catalog, setup readiness,
account checks and grants separately. A package release does not establish that
every catalog provider is certified, every managed app is configured, or every
project rollout is enabled. Provider-specific public OAuth verification and
legacy consumer migration are independent operational matters.

Sources: OSS `packages/cli/src/commands/cloud/connections.ts`, its four Connection
CLI test suites, `packages/connect/README.md`, `packages/connect/src/capability-resolver.ts`,
and Cloud `docs/internal/connection-platform-strategy.md`.

#### Chat suggestions release tracking

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

### polpo-react


Verified on 2026-08-24 against Polpo OSS `0.15.109`, current `@polpo-ai/react` `useChat`,
`@polpo-ai/sdk` durable delivery and continuation, and `@polpo-ai/chat` `0.11.1` presentational
components.

The React runtime and UI component packages release independently. Inspect installed component
props before copying an example from a different package version.

#### Runtime contract recheck — 2026-10-09

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


#### Chat suggestions release tracking

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

## Release notes added by PRs #11–#14 (before the rewrite was merged)

### polpo

#### Project environments release contract

Reconciled on **2026-10-15** against published OSS `0.17.3` and the deployed
Cloud canary. Development/Production targeting is available in the OSS client
and CLI. Managed provisioning, authenticated routing and dashboard selection are
rollout-gated per project; the global project migration has not run. Legacy
project/key migration remains an explicit Cloud operation. Never infer
availability or migrate Live/Test state from names alone.

#### Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.8`. The release includes
the versioned hook pack contract, shared chat/Run/Project Loop lifecycle integration,
command, HTTPS, tool, MCP, prompt and verifier-agent handlers, CRUD API, SDK, CLI,
deployment ordering and self-hosted documentation. Managed Cloud execution still
depends on its tenant schema, host adapters and `runtime.hooks.mode` rollout.

#### Runtime Steering release contract

OSS `0.18.9` adds `polpo runs steer`, `polpo runs steering get`, and receipt-aware
SDK/API control. Project targeting and Development/Production resolution use the
same linked project and environment rules as the other Cloud CLI commands.

### polpo-agents

#### Project environments release contract

Reconciled on **2026-10-15** against published OSS `0.17.3` and the deployed
Cloud canary. Development/Production targeting is available in the OSS client
and CLI. Managed provisioning, authenticated routing and dashboard selection are
rollout-gated per project; the global project migration has not run. Legacy
project/key migration remains an explicit Cloud operation. Never infer
availability or migrate Live/Test state from names alone.

#### Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.8`. Agents may reference
trusted packs from `.polpo/hooks` through `hooks: string[]`. Referenced packs must
exist before deployment and cannot widen model, tool, Connection, entitlement or
approval policy. Managed Cloud availability is rollout-dependent.

#### Runtime Steering release contract

Verified on **2026-10-17** against OSS `0.18.9`. Agents and Project Loop agent
nodes may declare steering policy. The runtime resolves node/Loop/agent/project/
platform precedence, and exposes admission separately from eventual delivery.
Managed Cloud availability remains dependent on the durable host rollout.

### polpo-runtime

#### Project environments release contract

Reconciled on **2026-10-15** against published OSS `0.17.3` and the deployed
Cloud canary. Development/Production targeting is available in the OSS client
and CLI. Managed provisioning, authenticated routing and dashboard selection are
rollout-gated per project; the global project migration has not run. Legacy
project/key migration remains an explicit Cloud operation. Never infer
availability or migrate Live/Test state from names alone.

#### Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.8`. Runtime Hooks use a
versioned, redacted envelope and deterministic decision composition across direct
chat, Run-backed chat, Channels and Project Loop agent nodes. `tool:before` remains
before side effects; `turn:stop` permits at most one tool-free feedback recovery.
Managed Cloud availability is rollout-dependent.

#### Runtime Steering release contract

Verified on **2026-10-17** against OSS `0.18.9`. Steering exposes separate
admission and delivery receipts, BCP 47 localized reject/too-late outcomes,
policy resolution across Project Loop node/loop/agent/project/platform scopes,
and public API, SDK, and CLI receipt lookup. Managed Cloud must use durable
tenant/project/environment-scoped storage before acknowledging a message; an
in-memory OSS registry alone does not provide cross-replica delivery.

### polpo-channels

#### Project environments release contract

Reconciled on **2026-10-15** against published OSS `0.17.3` and the deployed
Cloud canary. Environment-aware client and CLI targeting is published. Managed
provisioning and isolated Channel state remain rollout-gated per project; do not
infer Cloud availability until that project's migration is complete.

#### Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.8`. Channel-originated
agent turns participate in the same Runtime Hooks lifecycle as direct chat.
No new Channel configuration field or React transport contract is required;
managed Cloud availability remains rollout-dependent.

#### Runtime Steering release contract

OSS `0.18.9` keeps Channel transport separate from Run steering admission. Channel
turns may participate in the host's run-scoped steering policy, but this release
adds no Channel definition field or provider-specific steering UI.

### polpo-integrations

#### Project environments release contract

Reconciled on **2026-10-15** against published OSS `0.17.3` and the deployed
Cloud canary. Development/Production targeting is available in the OSS client
and CLI. Managed provisioning, authenticated routing and dashboard selection are
rollout-gated per project; the global project migration has not run. Legacy
project/key migration remains an explicit Cloud operation. Never infer
availability or migrate Live/Test state from names alone.

#### Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.8`. Hook tool and MCP
handlers use ordinary agent authorization and Connection grants. Authenticated
HTTPS handlers resolve a named Connection host-side; secrets never belong in the
hook pack or event envelope. Managed Cloud availability is rollout-dependent.

#### Runtime Steering release contract

OSS `0.18.9` does not change Connection, MCP, OAuth, or credential-broker contracts.
Steering content is user input for an active Run and must never carry credentials
or widen tool and Connection grants.

### polpo-react

#### Project environments release contract

Reconciled on **2026-10-15** against published OSS `0.17.3` and the deployed
Cloud canary. Environment-aware client, React provider and CLI targeting are
published. Managed provisioning and dashboard selection remain rollout-gated per
project; do not infer Cloud availability until that project's migration is complete.

#### Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.8`. Runtime Hooks are
server-side project policy and do not add a React chat frame or client-side
execution API in this release. Existing streaming, Session and interaction
contracts remain unchanged; managed Cloud availability is rollout-dependent.

#### Runtime Steering release contract

OSS `0.18.9` exposes steering through the SDK and authenticated Runs API. It adds
no React-side execution authority; applications render receipt outcomes and keep
the server authoritative when a local view of the safe boundary is stale.

