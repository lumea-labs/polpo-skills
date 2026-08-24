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

Validate and sanitize schemas before provider submission. Provider-supported JSON Schema is a
subset: avoid unsupported remote references and formats such as `format: "uri"` when the selected
provider rejects them. Return a stable diagnostic naming the incompatible path and keyword.

For streaming, buffer until the structured value is complete and schema-valid, then emit one
canonical JSON content value. Do not expose partial invalid JSON as a successful result.

## Parallel Server Tool Calls

`parallel_tool_calls: true` opts into bounded parallel execution only when every call in the
batch is classified read-only. Any write or unknown classification keeps the batch sequential.
Persist results in model call order even when execution finishes out of order.

Request-scoped client tools require `parallel_tool_calls: false`. Mixed server/client batches,
duplicate call IDs, and partially malformed batches fail closed.
