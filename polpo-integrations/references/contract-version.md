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
the self-hosted dashboard's `/data` page. Cloud adds Neon provisioning, Live/Test
isolation, agent access administration and `polpo_databases_*` MCP/builder tools.
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

The current published runtime baseline is `0.16.0`. The Loop completion and
request-context extension targets `0.16.1` (OSS PR #447). Its runtime/React
contracts and limits are documented in the corresponding interaction references.
This release note does not change the verification dates for unrelated features
listed above. Channel suggestion rendering is not introduced by this extension.
