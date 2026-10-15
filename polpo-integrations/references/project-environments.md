# Connection environment ownership

Published in OSS `0.17.3` and reconciled on 2026-10-15 against the deployed Cloud
canary. Managed routing, OAuth callback binding and isolated credentials require
the selected project to have completed the Cloud environment migration.

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
