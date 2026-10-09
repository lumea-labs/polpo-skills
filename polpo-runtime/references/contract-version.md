# Contract Version

Verified on 2026-08-29 against Polpo OSS `0.15.128`, `@polpo-ai/sdk`, `@polpo-ai/react`, core
Project Loop bindings/input projection, durable Run delivery, steering, structured output,
parallel server tools, Loop human metadata and logical groups, and production-tested Schedules
V2 lifecycle and idempotency behavior.

Exact provider/model capabilities may change independently. Validate the selected model's tool,
reasoning, modality, and JSON Schema support at runtime boundaries.

## Application Data preview contract

Data was separately verified on **2026-10-09** against the OSS and Cloud
`feat/data-primitive` branches. It is **unreleased**: the public registry package
`0.15.143` does not contain Data, even though local development artifacts may use
that version number. The baseline versions above remain the verification level
for unrelated features.

Before using Data, inspect the installed exports, API and `polpo data --help`.
Use an explicitly validated development build or a subsequent published release
that includes the feature; do not claim that installing registry `0.15.143`
enables it. Reference sources are OSS `docs/data.md` and Cloud
`docs/docs/platform/data.mdx` on those feature branches.
