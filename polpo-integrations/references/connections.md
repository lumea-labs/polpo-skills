# Connections

Connections are durable project authorization records with encrypted secret material, provider
metadata, status, granted scopes, and optional trusted binding dimensions.

## Logical Slots

Custom tools declare logical slots rather than Connection IDs:

```ts
connections: {
  siteApi: {
    provider: "sitoinchat",
    mode: "gateway",
    scopes: ["site:read"],
    description: "Read the authorized site",
  },
}
```

At invocation time the host derives a trusted selector from `ToolInvocationContext` and chooses
one active matching Connection. Resolution must fail closed when scope is denied, no Connection
matches, more than one matches, the slot is invalid, or the resolver is unavailable.

The example assumes a configured custom HTTP Connector with a matching request policy.
Tool code calls `ctx.connections.require("siteApi").request({ method: "GET", path: "/site" })`.
The host attaches credentials outside the sandbox; the model receives only the tool result.
Gateway and direct credentials coexist. For Git, HMAC, binary uploads or a client
library that needs its own credential, declare `mode: "legacy_credentials"` and
use `ctx.connections.require(slot).getToken()`, `.getKey()` or `.getHeaders()`.
Omitted mode retains this direct-access compatibility meaning. In managed Polpo,
the operator must separately approve the exact `credentialSlots` on the grant;
the tool declaration cannot authorize itself. There is no ambient project-wide
credential inventory and no fallback from a denied gateway to direct access.
Direct code must keep credentials out of results, logs and model arguments.
Revocation stops future export but cannot recall a previously copied credential.
The credential retains provider-granted permissions; a narrower slot scope does
not attenuate the exported token. Gateway operation policy cannot constrain
direct requests made by tool code.

## CLI Operations

```bash
polpo connections list
polpo connections setup-readiness gmail --oauth-client-mode managed --json
polpo connections connectors register ./connector.json
polpo connections connectors disable CONNECTOR_ID
polpo connections grants
polpo connections bind CONNECTION_ID --binding BINDING_JSON
polpo connections bind CONNECTION_ID --clear
polpo connections grant-slot CONNECTION_ID \
  --agent leo --tool site_context_get --scope site:read
polpo connections grant-slot CONNECTION_ID \
  --agent leo --tool repository_checkout --scope repo --credential-slot github
polpo connections grant-slot CONNECTION_ID \
  --agent leo --tool repository_checkout --clear-credential-access
polpo connections revoke-slot GRANT_ID
polpo connections readiness \
  --agent leo --tool site_context_get --slot siteApi \
  --provider sitoinchat --scope site:read \
  --user USER_ID --metadata METADATA_JSON
```

Use the installed CLI help for exact binding input flags. Binding dimensions may include trusted
principal, tenant, and resource identifiers. Scope changes should be possible without rotating
unrelated provider credentials when the provider grant remains valid.

`readiness` must report status, required versus granted scopes, slot ambiguity, and unresolved
trusted selectors before a run starts.
The generic readiness probe checks gateway access without exporting a secret;
it does not prove direct credential consent. Omitted `credentialSlots` preserves
active consent; `[]` clears it. Revoked grants need fresh explicit consent when
reactivated. The same field is available in `POST .../connect/grants` and
`polpo_connections_grant_slot`; the dashboard offers Credential access per tool.

`setup-readiness` checks Connector authentication prerequisites before account setup.
It does not verify an account or grant agent access. A key-only record needs an API
endpoint and request policy before it can provide a gateway capability.
