---
name: polpo-agents
description: Design and configure current Polpo agents, including directory-based definitions, model profiles and routing, tool policies and loading, assigned skills and Loops, chat preferences, Memory, Knowledge, and sandbox defaults. Use when creating or changing an agent rather than invoking it.
---

# Polpo Agents

Design the smallest agent capability ceiling that supports the intended surfaces. Agent
configuration is static policy; request, Channel Route, Loop step, execution, and trusted grants
may narrow it but must never widen it.

## Workflow

1. Read the existing agent directory and project settings before changing the definition.
2. Separate identity and instructions from runtime capabilities. Put instructions in
   `instructions.md`; put authored policy in `agent.json`.
3. Choose a concrete model or explicit profile. Enable automatic model or execution routing
   only when the project defines bounded candidates and a deterministic fallback.
4. Define the global `allowedTools` ceiling, then add chat or Channel restrictions only where
   the same agent needs different exposure by surface.
5. Assign complete skill bundles and Project Loops explicitly. Do not grant every project skill
   or Loop implicitly.
6. Configure Memory and sandbox defaults only when the use case needs them. Keep Knowledge
   sources project-level rather than embedding them into agent instructions.
7. Validate the materialized agent and every referenced model profile, tool, skill, MCP server,
   volume, and Loop before deployment.

## Invariants

- Model IDs use `provider/model`. Profile references use `{ "profile": "name" }`.
- `allowedTools` is an authorization ceiling, not a prompt suggestion.
- `toolLoading` controls schema disclosure after authorization; it cannot grant a tool.
- Per-surface and per-execution policies are intersections. Unknown or incompatible
  `tool_choice` values fail closed.
- Chat interactions require both agent permission and client capability.
- Trusted identity, grants, Connection references, and hidden tool bindings do not belong in
  model-visible agent configuration.

## References

- [references/definition.md](references/definition.md): directory format and core fields.
- [references/models-and-routing.md](references/models-and-routing.md): direct models, profiles,
  model routing, and direct-versus-Loop routing.
- [references/tools-and-skills.md](references/tools-and-skills.md): tool ceilings, surface policy,
  progressive disclosure, and skill bundles.
- [references/memory-and-knowledge.md](references/memory-and-knowledge.md): personal Memory versus
  project Knowledge.
- [references/sandbox.md](references/sandbox.md): isolation, lifecycle, and volume grants.
- [references/contract-version.md](references/contract-version.md): verified contract version.
