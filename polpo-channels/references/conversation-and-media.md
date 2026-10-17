# Conversation, Delivery, And Media

Most behaviour is configured per Channel as JSON settings, passed with
`polpo channels add ... --settings '<json>'` or `polpo channels update <id> --settings '<json>'`:

```json
{
  "concurrency": { "strategy": "burst", "debounceMs": 1500 },
  "responseDelivery": { "style": "conversational", "targetCharacters": 900, "maxMessages": 6 },
  "responseModality": "text",
  "activity": { "typing": "immediate", "readReceipt": "immediate" },
  "activeRunPolicy": { "behavior": "reject", "reply": "One moment, I'm still on your last message." }
}
```

Run `polpo channels update --help` for the fields the installed version accepts.

## Incoming Messages

Text, replies, images, audio, video, and documents arrive as one provider-neutral turn.
Attachment bytes are downloaded only when needed, with the Channel's credentials and size and
type limits.

Voice notes go through a pipeline: download, transcribe, run the turn in the detected language,
then answer as text or synthesized voice depending on `responseModality`. Answers are text or
voice, not both.

## Several Messages At Once

People often send several short messages, or a photo and then a caption. `concurrency` decides
what happens:

- `burst` / `debounce`: wait briefly (`debounceMs`) and answer the group as one turn;
- `queue`: answer in order (`maxQueueSize`, `onQueueFull`);
- `drop` or `concurrent`: rarely what a chat needs.

If a message arrives while the agent is still answering, it is queued or used to steer the run.
`activeRunPolicy: { "behavior": "reject", "reply": "..." }` instead sends a fixed reply.

## Outgoing Answers

`responseDelivery.style: "single"` sends one message and splits only at the provider's size
limit. `"conversational"` splits long answers into natural chunks of about `targetCharacters`,
up to `maxMessages`. Splits happen at paragraphs, sentences, or spaces; text is never cut off
because of `maxMessages`.

When a turn answers one specific message, the reply quotes it where the provider supports that.

A provider accepting a message does not mean it was delivered or read.
