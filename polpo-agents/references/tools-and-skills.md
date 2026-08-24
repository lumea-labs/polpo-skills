# Tools And Skills

## Tool Policy

`agent.allowedTools` is the global ceiling. The effective set is the intersection of every
applicable restriction:

```text
agent ceiling
intersection current mode (chat, channels, or loop)
intersection Channel Route when the current turn is a Channel
intersection Loop and step declarations when executing a Loop
intersection request execution override
intersection trusted grants
```

The policy of a preceding chat or Channel turn does not leak into an explicit Project Loop.
Polpo recalculates Loop policy while preserving the canonical Session and trusted invocation
context. Route policy remains scoped to the Channel turn unless an explicit contract says
otherwise.

Client-side OpenAI-compatible tools are also filtered by the current mode policy. They are
request capabilities, not additions to the agent ceiling.

## Tool Loading

- `direct`: expose authorized tool schemas directly.
- `progressive`: expose discovery and activation capabilities, then load selected schemas.
- `auto`: let the runtime choose after authorization based on the effective tool set.

Loading mode changes model-visible schemas only. Discovery must never reveal unauthorized tool
names or descriptions, and activation cannot widen the effective set.

Tools that need filesystem execution declare `requiresSandbox`. This is capability metadata;
the runtime still enforces sandbox policy and allowed paths.

## Skills

Agent `skills` contains installed skill names. A skill is a complete binary-safe bundle:

```text
skill-name/
|-- SKILL.md
|-- references/
|-- scripts/
`-- assets/
```

The runtime provides `skill_list` and `skill_read`. `skill_read({ name })` returns the
entrypoint and textual references; `skill_read({ name, path })` reads one exact bundle-relative
resource. Do not tell the model to use general workspace `read` for skill internals.

Per-request `polpo.skills` activation is additive and ephemeral. It prioritizes assigned skills
for one execution without removing other assigned skills or changing the agent. Reject a
requested skill that is not assigned to the effective agent or Loop.
