# Conversation, Delivery, And Media

## Incoming Turns

Normalize text, replies, images, audio, video, and files into a provider-neutral turn while
retaining safe provider identifiers. Fetch attachment bytes only when required, with scoped
provider credentials and explicit size/type/time limits.

Voice support is a pipeline, not an adapter assumption:

1. verify and fetch provider media;
2. transcribe through the configured STT provider;
3. retain detected language when available;
4. execute the canonical conversation turn;
5. choose text or voice response according to Channel/user policy;
6. synthesize TTS with the resolved language and deliver through provider capability.

Do not silently return both text and audio when response modality is exclusive.

## Bursts And Active Runs

Messaging users often send several short messages and attachments. Use bounded burst/debounce
aggregation before a run starts. Once a run is active, use the configured queue/steer/reject
policy rather than starting uncontrolled parallel turns in one Session.

Record safe burst membership, provider message IDs, reply target, queue decision, and Session/Run
IDs in Channel events. Never log media bytes, credentials, or trusted grants.

## Outbound Responses

Default to one logical message and split only at provider limits. Conversational delivery may
prefer semantic segments:

```json
{
  "style": "conversational",
  "targetCharacters": 900,
  "maxMessages": 6
}
```

Split at paragraphs, sentences, or whitespace, preserve exact output and Unicode, and never
truncate because `maxMessages` was reached. Use provider reply-to when a turn maps to one source
message; preserve burst context in events when a single reply covers multiple messages.

Provider acceptance is not proof of delivered/read status.
