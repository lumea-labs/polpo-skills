# Channel Conversation Suggestions

Requires the 0.17.1 contract and an upgraded host. Check release tracking before
using it; installing an SDK alone does not enable a managed Channel.

## Negotiate and preserve the source

Enable agent `chat.suggestions.enabled`, `ChannelRuntime({ suggestions: true })`,
and `suggestions` in `createConversationChannelTurnHandler` options. The bridge
option can be a trusted async resolver of `{ turn, invocation }`, returning the
existing boolean or request options. It runs again after client tools, so context
and current hosted policy can change before a Loop continuation. Unsupported or
disabled hosts omit controls; Channel questions stay disabled.

A custom completion adapter must preserve `polpo.suggestions` and
`polpo.suggestionsSource.assistantMessageId`, and supply the canonical SessionStore.
The bridge uses the persisted assistant message as the source. Only message-kind
suggestions become choices. Application links/postbacks keep their separate
semantics and must never become model prompts.

## Deliver and admit a selection

Let the shared runtime send the main answer before optional controls. WhatsApp
uses up to three buttons or a list for four to ten choices; generation remains
maximum five/default three. The adapter bounds and disambiguates labels without
changing stored prompts. Service-window rules still apply.

Use shared atomic state across replicas. The provider sees an opaque random
reference, not the prompt, Session ID or trusted identity. A single-use set is
bound to the installation/revision, thread, recipient and source answer, with a
24-hour TTL. Preserve the provider's verified source message reference: WhatsApp
`context.id` refers to the controls, while the incoming reply ID does not.

The bridge re-resolves current identity, scope and Session, then checks the exact
latest canonical source before admitting the original prompt. Keep that private
selection provenance through the existing queue; never put it in public event
payloads or logs. A custom handler bypassing the bridge must perform the same
checks. Do not bootstrap a replacement Session for a stale selection.

After admission, a Loop resume uses normal fresh-grant/run authorization; do not
reapply the original control's TTL or old assistant-version check to an already
admitted run. Preserve existing Session/run coordination. Atomic selection claims
do not create a transaction with arbitrary Session writes or exactly-once tools.
An uncertain dispatch leaves the selection spent; a fresh user message remains
possible.

## Failure, rollback and acceptance

Optional resolver/model/projection/delivery failures preserve the main answer.
A selection that cannot be verified is rejected. Never retry a completed main
operation merely because sending its controls failed.

Keep the reserved `polpo_suggestion:` callback guard even when disabled. Unknown,
stale or malformed references cannot fall through to generic application actions.
A binary downgrade must retain this guard while earlier controls remain visible.

Test signed button/list callbacks, duplicate clicks across two runtimes, stale
sources after queueing, changed identity/grants, optional delivery failure and
client-tool-to-Loop continuation. Distinguish intercepted Graph HTTP tests from
Meta acceptance and actual device rendering; a real roundtrip needs an explicitly
authorized recipient. No new CLI command or agent-directory action list is needed.
