# Memory And Knowledge

Memory and Knowledge are separate primitives.

## Memory

Memory stores durable facts, preferences, and episodes associated with an authorized scope such
as an external user, agent, project, or conversation. Use typed Memory items and explicit scope;
do not append an unbounded transcript or arbitrary prompt text.

Retrieval should be bounded, policy-controlled, and relevant to the current invocation. The host
must authorize scope before retrieval and record safe audit metadata. An agent can use Memory,
but Memory remains data collected over time rather than part of its static definition.

## Knowledge

Knowledge indexes project or organization sources such as documents, repositories, and durable
reference material. It is shared source material, not a record of one user's preferences or
conversation.

Keep Knowledge at project level in product UI and APIs. Agents may be granted access to selected
sources or retrieval capabilities, but sources should not be hidden inside an agent definition.

## Selection Rule

- "Remember that this user prefers Italian" is Memory.
- "Index the company's policies and product documentation" is Knowledge.
- A conversation transcript is Session history unless a deliberate extraction policy promotes
  a fact or episode into Memory.
