# Environment-aware providers

Published in OSS `0.17.3` and reconciled on 2026-10-15 against the deployed Cloud
canary. Managed UI and runtime provisioning remain rollout-gated per project.

On a supporting host, pass `environment="development"` or `"production"` to
`PolpoProvider`. Omission follows the authenticated key/endpoint; no SDK default
selects Development. The provider recreates client, store and event stream and
remounts children when environment, base URL, key, API prefix or fetch identity
changes. Keep custom fetch references stable across ordinary renders.

Keep the dashboard target in the route/tab, not a global cookie that changes
another tab's destination. Reset the selected session, pending modal and local
draft on target changes. Do not let a late response populate the new view or
continue an old run using the new client. Independent providers may target the
two environments simultaneously. Never expose privileged keys in a browser.
