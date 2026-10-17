# Contract Version

This skill set was verified on 2026-08-24 against Polpo OSS `0.15.109` and project layout
version `2`.

When the installed CLI or runtime differs:

1. inspect the installed package types and `polpo <command> --help`;
2. preserve backwards-compatible behavior unless the target explicitly requires migration;
3. do not invent fields from this reference if the installed schema rejects them;
4. report the version mismatch when it affects the requested operation.

The repository validation script treats this file as freshness metadata. Update it whenever a
public schema, command, route, or cross-surface invariant changes.

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

Verified on **2026-10-17** against published OSS `0.18.8`. The release includes
the versioned hook pack contract, shared chat/Run/Project Loop lifecycle integration,
command, HTTPS, tool, MCP, prompt and verifier-agent handlers, CRUD API, SDK, CLI,
deployment ordering and self-hosted documentation. Managed Cloud execution still
depends on its tenant schema, host adapters and `runtime.hooks.mode` rollout.

## Runtime Steering release contract

OSS `0.18.10` adds `polpo runs steer`, `polpo runs steering get`, and receipt-aware
SDK/API control. Project targeting and Development/Production resolution use the
same linked project and environment rules as the other Cloud CLI commands.

## Client-tool recovery compatibility

OSS `0.18.16` adds client-tool inspection and settlement through the runtime,
SDK and CLI without executing the agent again. For recovery, use the
[settlement contract](../../polpo-runtime/references/client-tools-and-interactions.md)
and inspect installed host capabilities and Cloud rollout before writing.
This release adds no new agent, Connection or Channel configuration; the
feature-specific verification baselines above remain unchanged.
