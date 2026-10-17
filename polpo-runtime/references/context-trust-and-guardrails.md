# Context Trust And Guardrails

Both features are project settings in `.polpo/project.json` (or the Cloud project settings).
A request cannot turn them on, off, or weaker.

```json
{ "settings": { "contextTrust": "enforce", "guardrails": { "policyPack": "standard" } } }
```

## Prompt Context Trust

`contextTrust: "enforce"` (default `"off"`) marks retrieved content and tool results as data
rather than instructions before they reach the model. It reduces prompt injection from web
pages, documents, and tool output. Turn it on for agents that read untrusted content.

## Guardrail Packs

Guardrails are off unless `settings.guardrails` is set. Choose a `policyPack`:

- `standard`: secret redaction, tool argument validation, private-network blocking, and approval
  for destructive operations;
- `strict`: additionally blocks destructive/policy failures and buffers streaming output for
  enforce-before-delivery;
- `custom`: standard baseline plus bounded literal content rules.

Guardrails check user input, retrieved context, tool arguments and results, and the final
answer. Optional limits: `maxInputCharacters`, `maxContextCharacters`, `maxModelInputCharacters`,
`maxToolOutputCharacters`, `maxFinalOutputCharacters`. `strict` delays streamed text until it has
been checked, so users see it later.

## Request Override

A request may ask for stricter enforcement only. It cannot enable an absent project policy,
weaken the selected pack, replace custom policy, or bypass host hooks.

Client-side tools and provider-executed tools run outside Polpo, so guardrails cannot check
them. Apply your own checks in the client tool handler.

Guardrail decisions are recorded in the run trace without prompts, raw tool data, or
credentials.
