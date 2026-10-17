# Trusted Identity And Channel Client Tools

## Identity Resolver

An identity resolver is an HTTPS endpoint in your application. For every incoming message,
Polpo calls it first, before choosing a Session, reading Memory, or running the model, to learn
which of your users is writing. Polpo authenticates to it with a project Connection, configured
with `--identity-resolver-endpoint`, `--identity-resolver-connection`, and
`--identity-resolver-timeout` on `polpo channels add` or `update`.

Your endpoint answers with:

```json
{
  "disposition": "dispatch",
  "user": "stable-user-id",
  "metadata": {
    "tenantId": "tenant-id",
    "workspaceId": "workspace-id",
    "contextVersion": 3,
    "grant": "short-lived-grant"
  }
}
```

`consume` handles pairing or non-agent messages without entering model history. A configured
resolver fails closed on timeout, denial, malformed output, or revocation. Returned identity and
metadata are immutable trusted invocation context, not ordinary message metadata.

Use a stable scope key/version or equivalent epoch to rotate/partition the Session when the same
provider user changes workspace while retaining the stable application user.

## Channel Tool Policy

For a Channel turn, intersect agent, `agent.channels.allowedTools`, Route, execution override,
and trusted grants before exposing server or client tool schemas. A subsequent explicit Loop
recalculates policy from agent, Loop, step, execution, and grants; the previous Route restriction
does not leak into it.

## Server-Side Client Tools

A phone has no browser to run client-side tools, so on a Channel your server runs them. Configure
typed function schemas and a fixed HTTPS handler on the Channel. The endpoint, Connection,
allowed tools, and optional Loop are fixed in configuration; the model cannot change them.

The handler receives idempotency key, Channel identifiers, canonical Session ID/version, tool
call, and trusted invocation identity. It returns model-visible `result` plus optional
`trustedMetadata`. Trusted metadata is merged into the next invocation context and never copied
into the tool result or history.

Bound continuation count, validate the schema, reject unknown tools before network work, and make
handler retries idempotent.
