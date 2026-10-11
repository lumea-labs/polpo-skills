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

## Connections development contract

The Connections changes verified locally through 2026-10-11 include reusable MCP
OAuth configurations, embedded setup, public callbacks, SDK/CLI configuration
management and concurrent revocation fences. They use unpublished development
artifacts whose source version still reads `0.15.144`; they are not part of the
published Data release with that same number. Verify installed commands, exports,
host endpoints and rollout before promising availability. Dashboard management of
reusable MCP configurations and embedded consent have local browser acceptance;
the coordinated OSS/Cloud release and deployed-consumer migration remain pending.
