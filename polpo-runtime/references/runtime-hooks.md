# Runtime Hooks At Runtime

Hook packs are configured on the agent (see the `polpo` skill's runtime-hooks reference for
authoring). This page explains what an application calling the agent will see.

- Hooks run on direct chat, Run-backed chat, Channel turns, and agent nodes in Project Loops.
  The set of packs is fixed when the run starts; a deploy during the run does not change it.
- A blocked tool call (`tool:before` deny) does not fail the run. The model receives an error
  result such as `Error: Runtime hook deny: <reason>` and continues.
- A block on `input:before`, `model:*`, `agent:spawn`, or `sandbox:start` fails the turn with an
  error. A block on a Loop event stops the Loop.
- A `turn:stop` hook can ask for one revision: the agent gets one extra model call without tools
  and the answer you receive is the revised one. Expect slightly longer latency on those turns.
  Structured-output requests skip this step.
- `ask` and `defer` currently block like `deny`; they do not create an approval you can answer.

When a user reports "the agent refused" or "the tool always errors", check the agent's `hooks`
and the hook trace (`runtime:hook` events) before changing prompts or tools.
