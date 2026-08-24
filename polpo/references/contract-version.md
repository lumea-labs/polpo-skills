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
