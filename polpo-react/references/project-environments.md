# Environment-aware providers

Unreleased contract inspected on 2026-10-14 at OSS `76d285cc`, based on `0.17.2`.
Do not use the option with the published `0.17.2` packages or assume Cloud UI and
runtime provisioning are already available.

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
