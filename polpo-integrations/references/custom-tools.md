# Custom Tools

A custom tool is a TypeScript file in `.polpo/tools/` that default-exports `defineTool(...)`.
Parameters use TypeBox schemas.

```ts
import { Type } from "@sinclair/typebox";
import { defineTool } from "@polpo-ai/tools";

export default defineTool({
  name: "crm_contact_get",
  description: "Look up a contact in the company CRM by email.",
  parameters: Type.Object(
    { email: Type.String({ format: "email" }) },
    { additionalProperties: false },
  ),
  timeoutMs: 30_000,
  connections: {
    crm: {
      provider: "acme_crm",
      mode: "gateway",
      scopes: ["contacts:read"],
      description: "Read access to the tenant's CRM",
    },
  },
  bindingsSchema: Type.Object({ tenantId: Type.String() }),
  serverBindings: {
    tenantId: { $context: "invocation.metadata.tenantId" },
  },
  execute: async (ctx, params) => {
    const response = await ctx.connections.require("crm").request({
      method: "GET",
      path: `/tenants/${encodeURIComponent(ctx.bindings.tenantId)}/contacts`,
      query: { email: params.email },
    });
    if (response.status >= 400) throw new Error(`CRM returned ${response.status}`);
    return JSON.stringify(response.body);
  },
});
```

This assumes an `acme_crm` HTTP connector whose request policy allows the call. The tenant ID
comes from trusted request metadata, not from the model, so the model cannot query another
tenant.

## Rules For Tool Definitions

- `name` is snake_case and unique in the project.
- `parameters` is the only schema the model sees. Do not put account IDs, tenant IDs, or tokens
  in it; use `connections` and `serverBindings` instead.
- `timeoutMs` must be between 1 second and 30 minutes. For long work, respect `ctx.signal`, make
  the operation idempotent, and report progress with `ctx.onUpdate`.
- Return a string or a valid tool result. `undefined` or something that cannot be serialized
  fails the call.

## The Execution Context

| `ctx.` | What it is |
|---|---|
| `connections.require(slot)` | The granted Connection for a slot (`.request()` for gateway slots) |
| `bindings` | Validated hidden values from `serverBindings` |
| `invocation` | Read-only trusted context: request, run, session, user, surface |
| `data` | Database records within the agent's grants, if the host enables it |
| `fs`, `shell`, `workDir` | Scoped filesystem and shell in the tool's sandbox workspace |
| `env` | Safe environment variables |
| `signal`, `onUpdate` | Cancellation and progress updates |

## Try It

```bash
polpo tools push .polpo/tools/crm-contact-get.ts
polpo tools run crm_contact_get --args '{"email":"maria@example.com"}'
polpo tools list
```

`tools run` executes in a Cloud sandbox without an agent and sends only `--args`. A tool that
needs hidden bindings, like the example above, fails there with `custom_tool_binding_missing`;
test it through an agent completion that carries the metadata (for example
`metadata: { tenantId: "t_123" }`). Binding-free tools are quickest to check with `tools run`. Then add the tool to the agent's `allowedTools`, grant the
Connection slot (see [connections.md](connections.md)), and deploy.
