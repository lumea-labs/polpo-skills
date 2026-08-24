# Trusted Context And Hidden Bindings

`ToolInvocationContext` is immutable host-owned data:

```ts
interface ToolInvocationContext {
  requestId: string;
  runId: string;
  sessionId?: string;
  user?: string;
  metadata: Readonly<Record<string, JsonValue>>;
  scope?: { key: string; version?: string };
  surface: "chat" | "task" | "loop" | "schedule" | "channel";
}
```

Create it only after authentication, Channel identity resolution, or another trusted host
boundary. Values must be finite plain JSON without cycles, prototypes, or undefined members and
are deeply frozen before custom tool code sees them.

## Hidden Bindings

`bindingsSchema` declares server-only values. `serverBindings` maps exact names to supported
paths under `invocation`, such as:

- `invocation.requestId`, `runId`, `sessionId`, `user`, or `surface`;
- `invocation.scope.key` or `invocation.scope.version`;
- `invocation.metadata.<safe-segment>`.

Required bindings missing from context fail before tool execution. Validate the resolved object
against `bindingsSchema` and expose it only as `ctx.bindings`. Do not duplicate it into model
arguments, tool results, prompts, or ordinary Session metadata.

Use `scope.key` for a host-owned partition such as a workspace and `scope.version` for an epoch
that invalidates previous context without changing stable user identity.
