# Contract Version

Verified on 2026-08-29 against Polpo OSS `0.15.128`, project layout version `2`, and the current
`AgentConfig`, model router, execution router, chat interaction, tool policy, sandbox, typed
Memory V2, and versioned Knowledge contracts.

For another version, inspect the installed schemas before authoring fields. Do not preserve
legacy aggregate agent files or `provider:model` identifiers merely because an old local skill
mentions them.

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
