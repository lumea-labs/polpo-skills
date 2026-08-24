# Models And Routing

## Concrete Models And Profiles

Pin one model when behavior should remain deterministic:

```json
{ "model": "anthropic/claude-sonnet-4-5" }
```

Reference a project model profile when several agents should share one centrally managed policy:

```json
{ "model": { "profile": "coding" } }
```

A profile may define a concrete model or a primary plus ordered fallbacks. Profiles are aliases
for model policy, not user plans or routing rules by themselves. Changing the `coding` profile
updates every agent that references it.

`allowedModelProfiles` narrows the project profiles an agent may use. It must never be used to
expand the project registry.

## Model Routing

`modelRouting.mode: "off"` keeps the configured model/profile pinned. `"auto"` opts the agent
into the project model router. The project router must define:

- bounded `allowedProfiles`;
- a deterministic `fallbackProfile`;
- optional ordered rules evaluated before classification;
- optional profile hints and concise routing guidance;
- timeout, confidence, and input-size limits.

The classifier sees only bounded current-request text, eligible profile names, safe labels, and
developer-authored hints. It must not receive credentials, full history, prompts, tool schemas,
or model definitions. An authorized explicit profile override wins and skips automation.

## Execution Routing

Execution routing answers a different question: direct agent turn or Project Loop. It never
selects a model profile.

`executionRouter.mode: "auto"` requires explicit `allowedLoops`; those candidates must also be
present in `assignedLoops`. Ordered deterministic rules should cover obvious cases before a
classifier is used. Define a safe direct or Loop fallback at the project/host policy boundary.

Keep model routing and execution routing independently configurable even when both contribute to
one runtime plan.
