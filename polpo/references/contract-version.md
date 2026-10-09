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
