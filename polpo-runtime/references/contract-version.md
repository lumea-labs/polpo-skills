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
the self-hosted dashboard's `/data` page. Cloud adds Neon provisioning, Live/Test
isolation, agent access administration and `polpo_databases_*` MCP/builder tools.
Reference sources are OSS `docs/data.md` and Cloud `docs/docs/platform/data.mdx`.
