# Project Loops

Define project-level graphs with `defineProjectLoop` or canonical JSON. Keep Loop logic outside
the agent definition and authorize it through `assignedLoops`.

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

Only an exact `{ "$context": "path" }` object is a binding. Resolve bindings recursively before
tool or agent schema validation. Never interpolate context into Bash strings.

Seed request-owned data under protected roots such as `request.metadata`. Missing paths, invalid
types, unsupported schemas, oversize projected input, or mutation of protected roots fail before
execution. Persist the complete context in checkpoints and resume.

An agent step with explicit `input` receives only the validated JSON projection plus its system
instructions and authorized runtime capabilities. It must not silently recover omitted creative
history. Trace sanitized binding paths, byte size, hash, and schema result without logging secret
values.

The example only establishes that each failure is a non-empty object. In a real integration,
replace `items` with the exact schema produced by the validation tool so malformed diagnostics
fail before the repair model runs.

## Policy And Resume

Tool policy is intersected from agent, Loop, step, execution override, and trusted grants.
Permissions and approvals can pause execution with a durable continuation; resume from the saved
checkpoint without rerunning completed steps.

Interactive `ask_user_question` is not a supported Loop-step tool. Perform conversational
clarification before starting the Loop, then continue into it through the canonical Session.
