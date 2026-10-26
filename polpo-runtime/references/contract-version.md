# Contract Version

Verified on 2026-08-29 against Polpo OSS `0.15.128`, `@polpo-ai/sdk`, `@polpo-ai/react`, core
Project Loop bindings/input projection, durable Run delivery, steering, structured output,
parallel server tools, Loop human metadata and logical groups, and production-tested Schedules
V2 lifecycle and idempotency behavior.

Exact provider/model capabilities may change independently. Validate the selected model's tool,
reasoning, modality, and JSON Schema support at runtime boundaries.

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

Verified on **2026-10-17** against published OSS `0.18.8`. Runtime Hooks use a
versioned, redacted envelope and deterministic decision composition across direct
chat, Run-backed chat, Channels and Project Loop agent nodes. `tool:before` remains
before side effects; `turn:stop` without an explicit termination gate permits at most one tool-free feedback recovery.
Managed Cloud availability is rollout-dependent.

## Runtime Steering release contract

Verified on **2026-10-17** against OSS `0.18.10`. Steering exposes separate
admission and delivery receipts, BCP 47 localized reject/too-late outcomes,
policy resolution across Project Loop node/loop/agent/project/platform scopes,
and public API, SDK, and CLI receipt lookup. Managed Cloud must use durable
tenant/project/environment-scoped storage before acknowledging a message; an
in-memory OSS registry alone does not provide cross-replica delivery. Terminal
Project Loop transitions seal the queue atomically so concurrent ingress is
either durably accepted and settled or reported as too late.

## Client-tool settlement release tracking

Published in the `0.18.16` OSS package set on **2026-10-17** for durable
client-tool resolution and settlement. It adds read-only inspection and an
idempotent terminal write that never invokes a model, handler, executor, or
Project Loop. Public outcomes are `success`, `failed`, and `cancelled`; Session
history preserves the existing `completed`/`error` state vocabulary and adds
`settlementOutcome` for exact semantics.

Before using it, verify that the installed core, server, SDK, stores, CLI, and
serving host contain the settlement contract and that the managed write gate
is enabled. Package publication alone does not enable a Cloud project; Cloud
writes default to off and are enabled per project/environment. Existing tenant
schemas must be migrated before deploying the matching stores, because normal
history reads also project settlement state. Hosts without the atomic store
capability must reject writes rather than emulate them with a read-then-update
sequence. Versioned API contract:
<https://github.com/lumea-labs/polpo/blob/v0.18.16/docs/client-tool-settlement.md>.


## Termination gate compatibility

The runtime-hardening baseline is OSS `0.18.17`. Opt-in same-agent termination
validation requires the coherent OSS `0.18.18` package set and a serving host
containing that implementation. A controlling `turn:stop` gate can return
structured `continue` feedback while retaining authorized tools and conversation;
explicit cycle/time/reported-token limits and durable checkpoint semantics apply.
The ordinary hook contract above remains valid without a gate. Cloud additionally
requires `managed.terminationGate.enabled`; do not infer availability from a
package version alone. No new agent-directory, SDK transport or CLI deploy format
is required: gate definitions live in the existing hook pack JSON.


## Automatic Session titles contract

OSS `0.18.21` adds asynchronous titles for new conversational Sessions, optional
host/project/agent overrides, revision-aware metadata events/readback and manual
rename protection. The previous serving baseline was `0.18.20`; these additions
require the new coherent package set and Cloud rollout. The title contract was
verified on 2026-10-26 through route, storage, SDK/React and browser tests.
This entry does not re-certify unrelated historical feature notes above.
