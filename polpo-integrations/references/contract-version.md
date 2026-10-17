# Contract Version

Verified on 2026-08-24 against Polpo OSS `0.15.109`, `@polpo-ai/tools`, `@polpo-ai/connect`, the
multi-file custom-tool artifact contract, immutable `ToolInvocationContext`, hidden server
bindings, logical Connection slots, and current CLI Connection management.

## Application Data release contract

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
the self-hosted dashboard's `/data` page. The current Cloud branch binds Neon,
Data grants and `polpo_databases_*` MCP/builder tools to isolated Development and
Production environments; published hosts may still expose the legacy Live/Test contract.
Reference sources are OSS `docs/data.md` and Cloud `docs/docs/platform/data.mdx`.

## Connections release contract

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
Cloud canary. Development/Production targeting is available in the OSS client
and CLI. Managed provisioning, authenticated routing and dashboard selection are
rollout-gated per project; the global project migration has not run. Legacy
project/key migration remains an explicit Cloud operation. Never infer
availability or migrate Live/Test state from names alone.

## Runtime Hooks release contract

Verified on **2026-10-17** against published OSS `0.18.8`. Hook tool and MCP
handlers use ordinary agent authorization and Connection grants. Authenticated
HTTPS handlers resolve a named Connection host-side; secrets never belong in the
hook pack or event envelope. Managed Cloud availability is rollout-dependent.

## Runtime Steering release contract

OSS `0.18.9` does not change Connection, MCP, OAuth, or credential-broker contracts.
Steering content is user input for an active Run and must never carry credentials
or widen tool and Connection grants.
