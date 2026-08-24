# Sandbox Defaults

An agent may define default `sandbox` policy. A request or task may narrow or override it within
host authorization.

```json
{
  "sandbox": {
    "isolation": "fresh",
    "lifecycle": {
      "onRelease": "pool",
      "stopAfterIdleMinutes": 30,
      "deleteAfterStopMinutes": 60
    },
    "volumes": [
      { "name": "reference", "access": "read-only" }
    ]
  }
}
```

## Isolation

- `reuse`: exclusively acquire a compatible warm project sandbox when available; another run
  may reuse it only after release.
- `fresh`: acquire one clean sandbox for the outer run. Root tools and nested Loop agent steps
  share the same lease until the outer run finishes.
- `shared`: explicitly allow concurrent outer runs to collaborate in one project workspace.

## Lifecycle

`lifecycle.onRelease` is `pool` or `destroy`. Pooled sandboxes may stop after
`stopAfterIdleMinutes` and be deleted after `deleteAfterStopMinutes`. The deprecated
`idleTtlMinutes` is accepted only for compatibility and must not be mixed with explicit fields.

## Volumes

The host defines volume strategy, credentials, and mount path. Agents and requests select only
granted volume names and may narrow access to `read-only` or manual writeback. They cannot create
a new grant or change `mounted` versus `hydrated` strategy. A normal local workspace exists even
when no persistent volume is selected.
