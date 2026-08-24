# OSS And Cloud Boundaries

Use these boundaries when planning or debugging Polpo behavior.

## OSS

OSS should define portable behavior and contracts:

- agent, Project Loop, Session, Run, Memory, Schedule, sandbox, and Channel types;
- OpenAI-compatible request and response behavior;
- provider-neutral Channel runtime and adapter interfaces;
- CLI, SDK, self-hosted stores, custom tool packaging, MCP, and Connections interfaces;
- deterministic validation, policy intersection, idempotency, and trace events.

## Cloud

Cloud should implement managed concerns:

- organizations, projects, membership, billing, entitlements, and rollout;
- hosted databases, queues, reconciliation, and durable stores;
- secure Connection custody, OAuth handoff, and provider provisioning automation;
- managed webhook URLs, tenant routing, audit persistence, and deployment operations;
- dashboard configuration and observation of OSS contracts.

## Decision Rule

If a self-hosted host could reasonably need the behavior, define the primitive in OSS first.
Cloud may add a managed adapter, storage implementation, UI, entitlement, or rollout around it.
Do not duplicate runtime semantics in Cloud route handlers or dashboard-only configuration.

Feature flags control availability, not the meaning of the public contract. Once a primitive is
GA, CLI, SDK, API, dashboard, and managed runtime should agree on its availability.
