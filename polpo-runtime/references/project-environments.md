# Project environment targeting

Unreleased contract inspected on 2026-10-14 at OSS `76d285cc` (baseline `0.17.2`).
Published `0.17.2` does not include it; Cloud runtime wiring is pending. Confirm
both package and host support before using the option.

```ts
const development = new PolpoClient({ baseUrl, apiKey: developmentKey, environment: "development" });
const production = new PolpoClient({ baseUrl, apiKey: productionKey, environment: "production" });
```

The optional `environment` is immutable per client. When omitted, the verified
key or bound endpoint chooses the runtime. SDK/API calls do not default to Dev.
Explicit selection prefixes the API with `/environments/<name>`; it never grants
access or falls back to another target. The same Polpo key covers Data and the
other authorized resources of its runtime.

Keep each run/session handle associated with its originating client. SSE replay,
client-tool responses, continuation and cancellation must reach that same target,
including after a UI switch. Application user/tenant/resource scope remains a
separate trusted identity; do not replace it with the environment name.

Self-hosted operators can bind a server using `ServerConfig.environment` or
`POLPO_PROJECT_ENVIRONMENT`. Each instance needs separate stores, files and
credentials; setting the name does not provision resources. Managed provisioning
and load isolation require separate Cloud validation.
