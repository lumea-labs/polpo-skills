# Connection environment ownership

Unreleased contract inspected on 2026-10-14 at OSS `76d285cc`, based on `0.17.2`.
Published `0.17.2` lacks this selector. Cloud ownership, OAuth callback binding
and migration work remain pending; verify host support before using it.

`PolpoConnectClient` accepts an optional immutable `environment` with the values
`development` or `production`. It applies to API, MCP, OAuth, setup and gateway
calls. Omission follows the key/bound endpoint; an unavailable target never falls
back. Organization OAuth app configuration uses a client without an environment.

The intended managed model starts Development without Production's Connections,
secrets or grants. Catalog entries and a managed OAuth application can be shared,
but that is not a shared account authorization. Agent names alone do not transfer
grants. Application subject/tenant scope remains independent of the environment.

OAuth state/setup must retain the original environment through callback, even if
the browser changes its selection. Do not reconstruct the destination from a
return URL or current UI state. Keep callback routing and credential rotation in
the host; selecting an SDK URL does not implement those security guarantees.
