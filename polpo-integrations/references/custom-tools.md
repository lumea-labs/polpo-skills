# Custom Tools

Define server tools with `defineTool` and TypeBox schemas:

```ts
import { Type } from "@sinclair/typebox";
import { defineTool } from "@polpo-ai/tools";

export default defineTool({
  name: "site_context_get",
  description: "Load the authorized site context.",
  parameters: Type.Object({}, { additionalProperties: false }),
  timeoutMs: 30_000,
  execute: async (ctx, _params) => {
    const api = ctx.connections.require("siteApi");
    return fetchSite(ctx.bindings.siteId, api.getHeaders(), ctx.signal);
  },
  connections: {
    siteApi: {
      provider: "sitoinchat",
      scopes: ["site:read"],
      description: "Authorized SitoInChat API access",
    },
  },
  bindingsSchema: Type.Object({ siteId: Type.String() }),
  serverBindings: {
    siteId: { $context: "invocation.metadata.siteId" },
  },
});
```

Names are snake_case. `parameters` is the only schema shown to the model. The execution context
provides scoped filesystem, shell, Connections, safe environment, work directory, SDK, abort
signal, updates, immutable invocation, and validated hidden bindings.

Declare `timeoutMs` between one second and 30 minutes. Long external operations should be
idempotent and respect `ctx.signal`; increasing a timeout does not replace progress events,
provider retries, or durable job design.

Return a plain string or a valid ToolResult. Undefined, unserializable, incomplete, or malformed
results fail at the tool boundary and must never become a missing result in later model history.

Tools that use filesystem or shell capabilities are marked `requiresSandbox`. Surface this
metadata in management UI and runtime inspection.
