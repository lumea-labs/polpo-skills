# Contract Version

Verified on 2026-08-29 against Polpo OSS `0.15.128`, project layout version `2`, and the current
`AgentConfig`, model router, execution router, chat interaction, tool policy, sandbox, typed
Memory V2, and versioned Knowledge contracts.

For another version, inspect the installed schemas before authoring fields. Do not preserve
legacy aggregate agent files or `provider:model` identifiers merely because an old local skill
mentions them.

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


## Chat suggestions release tracking

OSS `0.16.2` is published. It includes the `0.16.1` Loop completion,
request-context and five-item extension, plus a 15-second auxiliary deadline and
agent reasoning precedence (OSS PRs #447/#448).

The action suggestion contract is published in OSS `0.17.0` (OSS PR #449).
It adds a message/action TypeScript union and caller-authored links/postbacks;
use it only after the package and serving host are upgraded. Runtime and React
references describe the contract; CLI/agent-directory settings are unchanged.
The Channel buttons/list contract is published in OSS `0.17.1` (OSS PR #450).
Shared-queue selection admission across replicas requires `0.17.2` (publication
pending); keep hosted Channel suggestions disabled until every worker is upgraded.
Managed host wiring and real-device acceptance remain separate from the OSS
package release. Shared Chat/Playground rendering is still a separate UI contract.
These notes do not change verification dates for unrelated features above.
