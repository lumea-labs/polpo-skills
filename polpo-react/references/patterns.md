# React Patterns

## Durable Conversation

```tsx
function Conversation({ sessionId }: { sessionId?: string }) {
  const chat = useChat({ agent: "support", sessionId, durable: true });

  return (
    <section>
      <div aria-live="polite">
        {chat.messages.map((message, index) => (
          <ChatMessage
            key={message.id ?? index}
            msg={message}
            isLast={index === chat.messages.length - 1}
            isStreaming={chat.isStreaming && index === chat.messages.length - 1}
          />
        ))}
      </div>
      {chat.status === "reconnecting" && <span>Reconnecting</span>}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void chat.sendMessage(String(data.get("message") ?? ""));
        }}
      >
        <input
          name="message"
          disabled={chat.status === "streaming" || chat.status === "reconnecting"}
        />
        <button type="submit" disabled={chat.isStreaming}>Send</button>
      </form>
    </section>
  );
}
```

Keep stable dimensions for status, input, and tool controls so streaming state does not shift the
layout.

## Ask User

Render `pendingToolCall` only when the name is supported locally. Validate question arguments,
collect answers, and return one deterministic result through `continueToolResult`. Disable double
submit while continuation is pending.

## Suggestions

Map runtime suggestions without losing the distinct prompt:

```tsx
{chat.suggestions.map((suggestion) => (
  <button
    key={suggestion.id}
    onClick={() => chat.sendMessage(suggestion.prompt)}
  >
    {suggestion.label}
  </button>
))}
```

Do not reactivate historical suggestions after the user has sent a newer message.

## Client-Owned Tool

Maintain a typed registry keyed by tool name. Unknown tools render an error and are not executed.
The handler returns a JSON-serializable result, then calls `continueToolResult` with the current
Session version managed by the hook and a stable idempotency key.

## Session Navigation

The UI package does not own routing. Update the URL from `onSessionCreated` only if unmounting is
safe; for attached streams, navigation after `onFinish` avoids terminating the component before
the response completes. Durable streams may detach and later resume by Session/Run.

## Attachments

Send supported `ContentPart[]`, show upload/progress errors independently from the model run, and
use `resolveFileUrl` through an authenticated application route. Keep provider media IDs and
server filesystem paths out of public URLs.

## Custom Rendering

Use `renderMessage` and `ToolCallShell` for domain-specific presentation while keeping message,
tool, and continuation state in `useChat`. UI rendering must not become the source of truth for
tool completion.
