# Connection CLI Workflows

These commands are present in `@polpo-ai/cli` `0.16.1`. Inspect `polpo --version`
and `polpo connections --help` first. Project commands require an authenticated
CLI and a linked project. OAuth Client and MCP configuration commands also accept
`--organization <id>` for an authenticated organization administrator without a
linked project. The host must expose the corresponding Connect management routes;
installing the CLI alone does not configure a self-hosted Connect service.

## Inspect Before Creating

```bash
polpo connections catalog --json
polpo connections list --json
polpo connections setup-readiness gmail --oauth-client-mode managed --json
```

These checks answer different questions:

| Command | What it proves |
| --- | --- |
| `setup-readiness PROVIDER` | Selected Connector authentication/OAuth setup prerequisites; no account consent or runtime grant |
| `verify CONNECTION_ID` | Result of the Connector's configured account check; not every possible operation or agent permission |
| `readiness --agent ... --tool ... --slot ...` | Authorized, unambiguous gateway resolution for the supplied trusted invocation context; no credential export |

`verify` exits unsuccessfully unless the outcome is `passed`; unsupported or
inconclusive checks are not successful verification. `events`, `health` and
`reconcile` provide lifecycle diagnostics. Inspect their help before mutating
repair options; ordinary account setup does not require reconciliation.

## Custom API or Static MCP

```bash
polpo connections connectors register ./connector.json --json
polpo connections create api-key ./private-connection.json --json
polpo connections verify CONNECTION_ID --json
```

The non-secret Connector JSON declares `version: 2`, `protocol: "http_api"` or
`"mcp"`, supported authentication and destination/request policy. The private
Connection JSON selects its `providerId`, optional `authenticationId`, credential
and ownership. Match the published Connector/Connection schema; `api-key` is a
CLI creation route, not a replacement for the protocol/authentication model.
The other creation routes are `public` and `mcp`.

Keep credential-bearing files outside source control and readable only by their
owner. An existing key-only legacy record has no HTTP destination: use an
explicitly consented direct slot, or define the API Connector before using a
gateway. Creating a Connection does not create or assign tools.

Registering a Connector creates an immutable definition. Disable its identity
with `polpo connections connectors disable CONNECTOR_ID`; it is not an edit of
every account or a provider-side revocation. Use the exact returned definition ID.

## OAuth App and End-User Consent

Configure your own OAuth app only when choosing customer ownership. Register the
callback returned by the host in the provider console. A client ID/secret is not
an account access token. The example expects `GOOGLE_OAUTH_CLIENT_SECRET` to be
injected securely into the CLI environment; never put its value in arguments.

```bash
polpo connections oauth-clients set google_drive \
  --authentication oauth --client-id PROVIDER_CLIENT_ID \
  --client-secret-env GOOGLE_OAUTH_CLIENT_SECRET --json
polpo connections setup-readiness google_drive \
  --authentication oauth --oauth-client-mode customer --json
polpo connections setup-config set --origin https://app.example.com --json
polpo connections setup-session google_drive \
  --audience end_user \
  --subject '{"type":"external_user","namespace":"my-app","id":"gioia"}' \
  --authentication oauth --oauth-client-mode customer \
  --scope https://www.googleapis.com/auth/drive.readonly \
  --return-url https://app.example.com/settings/connections --json
polpo connections setup-start SETUP_ID --json
polpo connections setup-status SETUP_ID --json
```

Use the returned setup ID in the last two commands. In an actual application,
the trusted backend calls the equivalent API/Connect SDK with its platform key;
it derives the subject from the authenticated user. It sends only `setupUrl` or
the returned `authorizationUrl` to the browser. The user completes provider consent
before setup status can report completion. Scope requests do not guarantee grants.

Managed mode uses `--oauth-client-mode managed` and omits customer app registration
when the catalog offers a configured Polpo app. Self-hosted instance setup uses
`instance` on `setup-session`; the current Cloud `setup-readiness` command accepts
only `managed` or `customer`. Setup management does not choose personal/shared/
end-user ownership. `setup-config set` replaces approved exact HTTPS origins;
`--clear` removes that project's approvals. It does not revoke existing accounts.

```bash
polpo connections end-users list gioia --namespace my-app --json
polpo connections end-users revoke gioia CONNECTION_ID --namespace my-app --json
```

Revoking one Connection, removing an agent grant and revoking an OAuth Client
are different operations. `oauth-clients revoke PROVIDER` disables that app
registration without revoking existing Connections.

## Remote MCP

```bash
polpo connections mcp catalog --json
polpo connections mcp inspect https://mcp.example.com/mcp --json
polpo connections mcp connect linear --no-open
polpo connections mcp configurations create ./private-mcp-client.json --json
polpo connections mcp configurations list --json
polpo connections mcp configurations update CONFIGURATION_ID \
  ./private-mcp-client.json --revision CURRENT_REVISION --json
```

`mcp connect` prints a proposal for the signed-in dashboard; it does not authorize
the endpoint or forward the CLI key. Embedded MCP OAuth instead uses a reusable
configuration and `setup-session ... --configuration CONFIGURATION_ID`. The
configuration pins the server, transport and client registration. A catalog's
presence does not certify a real provider tool call. Discovery and explicit agent
tool selection remain necessary after consent.

## Agent Assignment and Direct Credentials

Use [connections.md](connections.md#cli-assignment) for `bind`, `grant-slot`,
`readiness`, `revoke-slot`, and the explicit `--credential-slot` consent.
`link`/`unlink` control this project's access to an eligible shared account;
they are separate from agent grants. Physical IDs belong in these trusted
administrative calls, not in model-visible tool parameters.

`capabilities list/set/revoke` are also administrative commands for logical
application bindings; their presence is not a product commitment to external
provider proxying. Keep the current integration design centered on agent tools.
