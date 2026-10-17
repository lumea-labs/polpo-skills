# Models And Routing

## Pick A Model

Run `polpo models list` (add `--provider anthropic` or `--plain`) and copy an exact ID. IDs use
`provider/model`:

```json
{ "model": "anthropic/claude-sonnet-5" }
```

Add fallbacks that are tried in order when the primary model fails:

```json
{ "model": { "primary": "openai/gpt-5", "fallbacks": ["anthropic/claude-sonnet-5"] } }
```

Use `reasoning` (`off` to `xhigh`) for models that support extended thinking. Higher levels are
slower and cost more.

## Model Profiles

A profile is a named model policy that several agents share, so you change one place instead of
every agent. In Polpo Cloud, profiles live in the project's model settings in the dashboard.
On a self-hosted runtime, define them in `.polpo/project.json` under `settings.modelProfiles`:

```json
{
  "settings": {
    "modelProfiles": {
      "support": "openai/gpt-4o-mini",
      "support-pro": { "primary": "openai/gpt-5", "fallbacks": ["anthropic/claude-sonnet-5"] }
    }
  }
}
```

Reference one from an agent with `{ "model": { "profile": "support" } }`. Changing `support`
changes every agent that references it, so check who uses a profile before editing it.

`allowedModelProfiles` lists the profiles an agent may switch to (for example through a request
override or the router). It can only narrow the project's profiles, never add new ones.

## Automatic Model Routing

`"modelRouting": { "mode": "auto" }` lets a router choose a profile per request; `"off"` (the
default) keeps the configured model. In Polpo Cloud the router is configured in the project's
model settings. The OSS packages contain the router, but the default self-hosted server does not
read a router configuration, so stay with `off` there unless the host wires it in.

A router configuration needs:

- `allowedProfiles`: the candidates (a subset of the project profiles);
- `fallbackProfile`: used whenever classification is skipped, slow, or unsure;
- optional ordered `rules` that match before any classifier runs, and short `profileHints`;
- optional `minConfidence`, `timeoutMs`, and `maxInputChars`.

The classifier sees only the current request text (bounded), profile names, and your hints, not
history, tools, or credentials. An explicit, authorized profile override in the request skips
the router.

## Execution Routing

Execution routing answers a different question: should this request be a direct agent turn or
run one of the agent's Project Loops? It never picks a model.

`"executionRouter": { "mode": "auto", "allowedLoops": [...] }` requires every candidate Loop to
also be in `assignedLoops`. Prefer explicit rules for obvious cases before relying on a
classifier, and define what happens when nothing matches. Model routing and execution routing
are configured independently.
