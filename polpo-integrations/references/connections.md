# Connections

Connections are durable project authorization records with encrypted secret material, provider
metadata, status, granted scopes, and optional trusted binding dimensions.

## Logical Slots

Custom tools declare logical slots rather than Connection IDs:

```ts
connections: {
  drive: {
    provider: "google-drive",
    scopes: ["files:read"],
    description: "Read the current tenant drive",
  },
}
```

At invocation time the host derives a trusted selector from `ToolInvocationContext` and chooses
one active matching Connection. Resolution must fail closed when scope is denied, no Connection
matches, more than one matches, the slot is invalid, or the resolver is unavailable.

The model receives neither the selected Connection ID nor token. Tool code uses the injected
capability to request headers, token, or key. Dispose short-lived capabilities after execution.

## CLI Operations

```bash
polpo connections list
polpo connections grants
polpo connections bind CONNECTION_ID --binding BINDING_JSON
polpo connections bind CONNECTION_ID --clear
polpo connections grant-slot CONNECTION_ID \
  --agent leo --tool site_context_get --scope site:read
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
