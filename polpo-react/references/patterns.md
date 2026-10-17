# React Patterns

## Server Proxy (Next.js)

Keep the API key on the server and check your own user session before forwarding:

```ts
// app/api/polpo/[...path]/route.ts
import { auth } from "@/lib/auth"; // your app's session check

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { path } = await ctx.params;
  const target = new URL(`/${path.join("/")}${new URL(req.url).search}`, process.env.POLPO_URL);
  const headers = new Headers({ authorization: `Bearer ${process.env.POLPO_API_KEY}` });
  for (const name of ["content-type", "accept", "last-event-id", "x-session-id", "idempotency-key", "if-match"]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
    // @ts-expect-error Node fetch needs duplex for streamed request bodies
    duplex: "half",
  });
  // fetch already decompressed the body; drop headers that describe the original encoding
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as PUT, proxy as DELETE };
```

Passing the upstream body through keeps SSE streaming intact. Forward `Idempotency-Key` and
`If-Match`: the SDK relies on them for safe retries and tool continuations. A relative `baseUrl`
such as `/api/polpo` works only in the browser; server-side code should use an absolute URL or
call Polpo directly with the key. Pass the signed-in user's ID as
`user` on chat requests (or `PolpoProvider`'s `user` prop) so Memory and grants are per user.
Restrict which paths the proxy forwards if browsers should not reach every API route.

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

Dispatch by kind. Preserve the item ID and order, display the label, and keep application
actions separate from new user messages:

```tsx
function selectSuggestion(suggestion: ChatSuggestion) {
  if (suggestion.kind === "action") {
    if (suggestion.action.type === "open_url") {
      openTrustedLink(suggestion.action.url);
    } else if (suggestion.action.type === "postback") {
      dispatchAuthenticatedPostback(suggestion.action.value);
    }
    return;
  }
  if (suggestion.kind === undefined || suggestion.kind === "message") {
    void chat.sendMessage(suggestion.prompt);
  }
}
```

`ChatSuggestion` comes from the runtime SDK. `openTrustedLink` and
`dispatchAuthenticatedPostback` are application-owned callbacks, not Polpo SDK methods.
Validate historical shapes/links before rendering, disable selection while busy, and use
native link semantics for URL controls when appropriate. Do not reactivate historical
suggestions after the user has sent a newer message or turn a postback into a tool result.

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
