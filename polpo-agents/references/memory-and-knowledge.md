# Memory And Knowledge

Memory and Knowledge are separate primitives.

## Memory

Memory V2 stores durable, typed items associated with an authorized scope. Supported scopes are
`org`, `project`, `agent`, `user`, `channel`, and `session`; `user` always means the hosted
application's `externalUserId`, never a Polpo account or organization member ID.

Use one of the maintained kinds: `fact`, `preference`, `open_thread`, `style`,
`failure_pattern`, `successful_episode`, or `procedure_hint`. Every item also carries explicit
provenance, lifecycle status, timestamps, and optional confidence and expiry. Do not append an
unbounded transcript or arbitrary prompt text.

The agent-scoped API is:

- `GET /v1/agents/{agentName}/memory/items` for filterable cursor pagination.
- `POST /v1/agents/{agentName}/memory/items` to create a typed item.
- `POST /v1/agents/{agentName}/memory/search` for bounded retrieval.
- `GET /v1/agents/{agentName}/memory/items/{itemId}/usage` for retrieval and mutation usage.
- `PATCH /v1/agents/{agentName}/memory/items/{itemId}` to update mutable fields.
- `DELETE /v1/agents/{agentName}/memory/items/{itemId}` to forget the item.

Retrieval should be bounded, policy-controlled, and relevant to the current invocation. The host
must authorize scope before retrieval and record safe audit metadata. An agent can use Memory,
but Memory remains data collected over time rather than part of its static definition.

The files `.polpo/memory.md` and `.polpo/memory/{agent}.md` belong to the legacy static prompt
memory contract. They are not a serialization of Memory V2 items. Do not use them when a task
requires external-user scoping, typed lifecycle, search, usage accounting, or selective forget.

## Knowledge

Knowledge indexes project or organization sources such as documents, repositories, and durable
reference material. It is shared source material, not a record of one user's preferences or
conversation.

Keep Knowledge at project level in product UI and APIs. Agents may be granted access to selected
sources or retrieval capabilities, but sources should not be hidden inside an agent definition.
The dashboard writes source grants to `metadata.agentGrants`; use explicit agent names or `*`.
Missing, malformed, or unmatched grants deny runtime access.

Knowledge is the public product name. Some current code and compatibility contracts still use
the internal name `brain`, including these REST paths and tool names:

- `GET|POST /v1/brain/sources` lists or ingests sources.
- `GET|PATCH|DELETE /v1/brain/sources/{sourceId}` manages one source.
- `POST /v1/brain/sources/{sourceId}/reindex` publishes a new immutable version.
- `GET /v1/brain/sources/{sourceId}/versions` lists version history.
- `GET /v1/brain/sources/{sourceId}/read` reads bounded chunks, optionally from a version.
- `POST /v1/brain/search` searches authorized sources within a token budget.
- `brain_search` and `source_read` are the optional explicit runtime tools.

Cloud exposes these REST paths through the project data plane for both dashboard sessions and
project-scoped API keys. Invalid bodies, filters, cursors, and bounds fail with HTTP 400 and the
stable `{ ok: false, code: "invalid_request", error: "Invalid Brain request" }` compatibility
envelope; clients must not depend on raw validator details.

Source inputs support `paste`, `file`, `url`, and `connection` in the OSS contract. Hosted Cloud
must reject local files and unsafe/private URLs at ingestion. The current dashboard exposes text
and public URL ingestion. Knowledge sources are managed through dashboard, API, or SDK; they are
not deployed from a `.polpo/knowledge` directory today.

When Knowledge rollout is enforcing, the runtime automatically retrieves relevant, cited chunks
for the current query and source grants. Explicit tools are separate: expose `brain_search` or
`source_read` in `allowedTools` only when the model must search or read sources on demand. A
successful management search does not prove runtime injection; use the agent runtime-context
inspection endpoint or a real completion to verify the grant and retrieval path.

Reindexing must retain prior versions for bounded historical reads while moving
`currentVersion` atomically. Deletion must remove the source from current retrieval immediately.
Never treat labels, source order, or model recollection as evidence that retrieval occurred; use
the returned citation identity `sourceId@version#chunkId`.

## Verification

Before declaring either primitive operational, verify:

1. Positive retrieval through the actual agent and expected scope/grant.
2. No retrieval after removing the grant or changing the external-user scope.
3. No cross-project or cross-user leakage using a unique marker.
4. Update/reindex behavior, historical reads, forget/delete, and empty-result behavior.
5. Invalid fields, duplicate IDs, unsafe source inputs, pagination cursors, and token limits fail
   deterministically without exposing tenant data.

## Selection Rule

- "Remember that this user prefers Italian" is Memory.
- "Index the company's policies and product documentation" is Knowledge.
- A conversation transcript is Session history unless a deliberate extraction policy promotes
  a fact or episode into Memory.
