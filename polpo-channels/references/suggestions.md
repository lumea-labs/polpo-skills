# Reply Buttons And Lists

Suggestions are short "what to say next" choices the agent offers after an answer. On a Channel
they appear as native controls: WhatsApp shows one to three reply buttons, or a list for four to
ten. The agent generates at most five (default three).

## Turning Them On

1. In the agent, set `chat.suggestions.enabled: true` (see `polpo-agents`).
2. The host must enable Channel suggestions. On a self-hosted runtime, see
   [self-hosted-channels.md](self-hosted-channels.md). Every worker must run `0.17.2` or later
   first.
3. Channel questions (`ask_user_question`) stay unavailable on Channels.

No CLI command or agent-directory setting beyond `chat.suggestions` is needed.

## What Users See

- The main answer is sent first, then the controls in a separate message.
- Labels may be shortened to fit the provider. The full stored prompt is what the agent
  receives when the user picks one.
- A choice is valid once, for 24 hours, and only while that answer is still the latest in the
  conversation. Stale or repeated taps are ignored rather than starting a new conversation.
- Application actions (links, postbacks) from web suggestions are not turned into Channel
  messages.
- If sending the controls fails, the main answer is still delivered and is not retried.

## Testing

Test with a real device and an authorised test number: tap a button, tap it again, tap an old
button after a newer message, and send a normal message instead of tapping. Intercepted HTTP
tests do not prove that WhatsApp renders the controls.
