# Connections

Connections are durable authorization records with encrypted secret references,
provider metadata, status, granted scopes, ownership and trusted binding dimensions.

## Domain Model

| Concept | Responsibility |
| --- | --- |
| Connector | Non-secret API (`http_api`) or MCP definition, supported authentication, endpoint policy, scopes, operations and verification |
| OAuth Client | Provider application registration used for consent; optional Polpo-managed app, customer app or self-hosted instance app |
| Connection | One authorized account or endpoint using one Connector and authentication method |
| Link | Allows a project to use an eligible Connection owned at a broader scope |
| Grant | Allows an exact agent/tool to use the Connection within granted scopes and trusted bindings |
| Credential | Encrypted secret material, separate from ordinary Connection metadata |
| Tool | The operation the agent actually calls; a Connection alone does not create a tool |

Protocol and authentication are separate: API and MCP are protocols; OAuth,
static tokens/keys and unauthenticated access are authentication choices when
supported by that Connector. An MCP URL is endpoint configuration. A custom
definition cannot invent authentication support missing from the provider.

One Connector can have many Connections, including two Gmail accounts. One
OAuth Client can authorize both. API and MCP definitions for the same vendor
can remain separate; do not assume tokens have interchangeable audiences.

OSS operators configure their own provider setup. Cloud supports customer setup
and optional managed OAuth apps where available. Managed describes who supplies
the OAuth application, not a different account owner or a successful verification.
An API key still needs to be supplied by its authorized owner.

Account audience (`personal`, `shared`, `end_user`) is independent of protocol
and authentication. OAuth can represent a human, bot, app or workspace depending
on the provider; it does not always mean a human user's data. The provider grants
the outer permission boundary; Polpo grants can narrow use but cannot add scopes.

For an end-user account, preserve the exact `{ type: "external_user", namespace,
id }` subject. Invocation `user` requires `metadata.connectionNamespace`, or use
canonical `metadata.connectionScope.principal`. Derive these values from the
authenticated application session. Multiple account matches fail closed; do not
ask the model to choose a Connection ID.

Connections currently give capabilities to agents. Application backends may
configure accounts, initiate consent and invoke agents; direct integration
execution as a standalone provider proxy is outside the product scope.

## Logical Slots

Custom tools declare logical slots rather than Connection IDs:

```ts
connections: {
  crm: {
    provider: "acme_crm",
    mode: "gateway",
    scopes: ["contacts:read"],
    description: "Read the tenant's CRM",
  },
}
```

At invocation time the host derives a trusted selector from `ToolInvocationContext` and chooses
one active matching Connection. Resolution must fail closed when scope is denied, no Connection
matches, more than one matches, the slot is invalid, or the resolver is unavailable.

The example assumes a configured custom HTTP Connector with a matching request policy.
Tool code calls `ctx.connections.require("crm").request({ method: "GET", path: "/contacts" })`.
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
direct requests made by tool code. Agent-level Vault compatibility is separate
from these Connection slot modes; neither path is removed by this contract.

## CLI Assignment

```bash
polpo connections list
polpo connections grants
polpo connections bind CONNECTION_ID --binding BINDING_JSON
polpo connections bind CONNECTION_ID --clear
polpo connections grant-slot CONNECTION_ID \
  --agent support --tool crm_contact_get --scope contacts:read
polpo connections grant-slot CONNECTION_ID \
  --agent support --tool repository_checkout --scope repo --credential-slot github
polpo connections grant-slot CONNECTION_ID \
  --agent support --tool repository_checkout --clear-credential-access
polpo connections revoke-slot GRANT_ID
polpo connections readiness \
  --agent support --tool crm_contact_get --slot crm \
  --provider acme_crm --scope contacts:read \
  --user USER_ID --metadata '{"connectionNamespace":"my-app"}'
```

Use the installed CLI help for exact binding input flags. Binding dimensions may include trusted
principal, tenant, and resource identifiers. Scope changes should be possible without rotating
unrelated provider credentials when the provider grant remains valid.

Run `readiness` before a real run. It reports status, required versus granted scopes, whether
several accounts match, and which trusted selectors are missing.
The generic readiness probe checks gateway access without exporting a secret;
it does not prove direct credential consent. Omitted `credentialSlots` preserves
active consent; `[]` clears it. Revoked grants need fresh explicit consent when
reactivated. The same field is available in `POST .../connect/grants` and
`polpo_connections_grant_slot`; the dashboard offers Credential access per tool.

See [connection-cli.md](connection-cli.md) for account setup, OAuth applications,
verification and the distinction between the three readiness checks. A key-only
record needs an API endpoint and request policy before it can provide a gateway
capability; it remains usable by explicitly authorized direct credential code.
