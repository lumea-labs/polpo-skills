# Project Loops

A Project Loop is a fixed workflow: tool steps and agent steps connected by `next`. Use one when
the order of work must not depend on the model's judgement. Put it in `.polpo/loops/` as
TypeScript (`defineProjectLoop`) or JSON, and let an agent run it by listing it in the agent's
`assignedLoops`. Check it with `polpo loops validate` and see the compiled JSON with
`polpo loops compile .polpo/loops/repair-site.ts`.

```ts
import { agentStep, defineProjectLoop, toolStep } from "@polpo-ai/core/loop-code";

export default defineProjectLoop({
  name: "repair-site",
  start: "validate",
  steps: {
    validate: toolStep({
      tool: "site_validate",
      input: { workingCopyId: { $context: "request.metadata.workingCopyId" } },
      saveAs: "validation",
      next: "repair",
    }),
    repair: agentStep({
      systemPrompt: "Correct only the supplied failures.",
      input: {
        failures: { $context: "validation.failures" },
        attempt: 1,
      },
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["failures", "attempt"],
        properties: {
          failures: {
            type: "array",
            minItems: 1,
            items: { type: "object", minProperties: 1 },
          },
          attempt: { type: "integer", minimum: 1 },
        },
      },
      next: "validate",
    }),
  },
});
```

## Context Bindings

An object that is exactly `{ "$context": "path" }` is replaced with the value at that path.
`saveAs` stores a step's output under a name later steps can read (`validation.failures` above).
Request data is available under `request.metadata`, filled from the completion's `metadata`.

A missing path, wrong type, or input that fails `inputSchema` stops the Loop before the step
runs, which is what you want: fix the binding rather than loosening the schema. Do not build
shell commands by pasting context values into strings; pass them as tool arguments.

An agent step with `input` sees only that input (plus its instructions and tools), not the whole
conversation. Leave `input` out when the step needs the conversation history.

The example only establishes that each failure is a non-empty object. In a real integration,
replace `items` with the exact schema produced by the validation tool so malformed diagnostics
fail before the repair model runs.

## Policy And Resume

A step's tools are limited by the agent's `allowedTools`, the Loop, the step, the request, and
trusted grants together. Approvals and permission prompts pause the Loop; when resumed it
continues from the saved checkpoint without repeating finished steps.

A Loop and each of its agent nodes can set a `steering` policy, for example `"reject"` on a node
where new instructions would break the workflow (see
[steering-and-runtime-plans.md](steering-and-runtime-plans.md)).

Interactive `ask_user_question` is not a supported Loop-step tool. Perform conversational
clarification before starting the Loop, then continue into it through the canonical Session.
