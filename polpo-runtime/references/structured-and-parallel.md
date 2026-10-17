# Structured Output And Parallel Tools

## Structured Output

Use OpenAI-compatible `response_format`:

```ts
response_format: {
  type: "json_schema",
  json_schema: {
    name: "customer_tier",
    strict: true,
    schema: {
      type: "object",
      properties: { tier: { type: "string", enum: ["free", "paid"] } },
      required: ["tier"],
      additionalProperties: false,
    },
  },
}
```

Providers support only part of JSON Schema. Avoid `$ref` to remote documents and formats such
as `format: "uri"` when the model's provider rejects them; the error names the path and keyword
to change. Use `additionalProperties: false` and list every property in `required` for strict
mode.

When streaming, Polpo buffers structured output and sends one complete, schema-valid JSON value,
so parse the final content, not partial chunks.

## Parallel Server Tool Calls

`parallel_tool_calls: true` opts into bounded parallel execution only when every call in the
batch is classified read-only. Any write or unknown classification keeps the batch sequential.
Persist results in model call order even when execution finishes out of order.

Request-scoped client tools require `parallel_tool_calls: false`. Mixed server/client batches,
duplicate call IDs, and partially malformed batches fail closed.
