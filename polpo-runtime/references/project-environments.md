# Targeting Development Or Production

Requires `@polpo-ai/sdk` `0.17.3` or later and a Cloud project with environments (or a
self-hosted server started with `POLPO_PROJECT_ENVIRONMENT`).

```ts
const dev = new PolpoClient({ baseUrl, apiKey: process.env.POLPO_DEV_KEY, environment: "development" });
const prod = new PolpoClient({ baseUrl, apiKey: process.env.POLPO_PROD_KEY, environment: "production" });
```

- Without `environment`, the client uses whatever the key and URL point to. The SDK does not
  default to Development (only the CLI does).
- With `environment`, requests go to `/environments/<name>/...`. That selects a runtime; it does
  not grant access. A key from the other environment, or a server bound to the other
  environment, is rejected. There is no fallback.
- `environment` is fixed per client. Create one client per environment instead of switching.
- One key covers everything in its environment, including `client.data()`.

## Keep Work With Its Client

A Session, run, stream, or pending tool call belongs to the environment that created it. Send
reconnects, `continueWithToolResult`, steering, and cancellation through the same client, even
if the user switches environment in your UI meanwhile.

The environment is not your user's identity. Keep passing `user` and trusted metadata as before.
