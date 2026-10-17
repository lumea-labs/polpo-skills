# Sandbox Defaults

Sandboxes are where tools that need a filesystem or shell run. In Polpo Cloud they are managed
for you. An agent can set default `sandbox` policy, and a request or task can override it within
what the host allows.

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

A volume is persistent storage that survives sandboxes. The host (Polpo Cloud) owns its storage,
credentials, and mount path. An agent's `sandbox.volumes` can only pick volumes the agent has
been granted and narrow access to `read-only` or manual write-back. Without a volume, the agent
still has a normal workspace that disappears with the sandbox.

Manage volumes and grants in Cloud with the CLI:

```bash
polpo volumes create reference --strategy hydrated --access read-only
polpo volumes grants set reference --agent support --access read-only
polpo volumes grants list --agent support
polpo volumes grants revoke reference --agent support
```

`mounted` volumes are attached directly; `hydrated` volumes are copied in and, for read-write,
written back automatically or manually (`--write-back auto|manual`).
