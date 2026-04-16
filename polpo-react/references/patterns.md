# Common Patterns

## Full App Assembly

### 1. PolpoProvider in layout

```tsx
// app/layout.tsx
import { PolpoProvider } from "@polpo-ai/react";

// baseUrl is the root URL — SDK appends /v1/ internally. Do NOT add /v1/ or /api/v1/.
// Cloud: "https://api.polpo.sh"
// Local dev: "http://localhost:3890"
<PolpoProvider
  baseUrl={process.env.NEXT_PUBLIC_POLPO_URL || "https://api.polpo.sh"}
  apiKey={process.env.NEXT_PUBLIC_POLPO_API_KEY}
  autoConnect={false}
>
  {children}
</PolpoProvider>
```

### 2. Sidebar with session list

```tsx
import { ChatSessionList } from "@polpo-ai/chat";
import { useSessions, useAgents } from "@polpo-ai/react";

function Sidebar() {
  const { sessions, isLoading, deleteSession } = useSessions();
  const { agents } = useAgents();
  const activeId = /* extract from URL */;

  return (
    <aside className="w-64 border-r">
      <ChatSessionList
        sessions={sessions}
        agents={agents}
        isLoading={isLoading}
        activeSessionId={activeId}
        onSelect={(id) => router.push(`/chat/${id}`)}
        onDelete={deleteSession}
      />
    </aside>
  );
}
```

### 3. New chat with landing → conversation

```tsx
import { Chat, ChatSuggestions, ChatAgentSelector, ChatInput, useChatContext } from "@polpo-ai/chat";

function NewChatPage() {
  const { agents } = useAgents();
  const [agent, setAgent] = useState<string | undefined>();

  return (
    <Chat
      agent={agent || agents?.[0]?.name}
      onSessionCreated={(id) => router.replace(`/chat/${id}`)}
    >
      {({ hasMessages }) =>
        hasMessages ? (
          <ChatInput />
        ) : (
          <Landing agents={agents} agent={agent} onAgentChange={setAgent} />
        )
      }
    </Chat>
  );
}

function Landing({ agents, agent, onAgentChange }) {
  const { sendMessage } = useChatContext();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>How can I help?</h1>
      <ChatAgentSelector agents={agents} selected={agent} onSelect={onAgentChange} />
      <ChatInput placeholder="Describe what you need..." />
      <ChatSuggestions
        suggestions={[{ text: "Automate a task" }, { text: "Generate a report" }]}
        onSelect={(text) => sendMessage(text)}
      />
    </div>
  );
}
```

### 4. Conversation with ask-user-question

```tsx
import { Chat, ChatInput, ChatAskUser, useChatContext } from "@polpo-ai/chat";

function ChatPage({ sessionId }: { sessionId: string }) {
  return (
    <Chat sessionId={sessionId} agent={agentName} agentName={displayName}>
      <ChatInputWithAskUser />
    </Chat>
  );
}

function ChatInputWithAskUser() {
  const { pendingToolCall, sendMessage } = useChatContext();

  if (pendingToolCall?.toolName === "ask_user_question") {
    return (
      <ChatAskUser
        questions={pendingToolCall.arguments.questions}
        onSubmit={(answers) => sendMessage(JSON.stringify({ answers }))}
      />
    );
  }
  return <ChatInput />;
}
```

### 5. Compact input in sidebar panel

```tsx

<div className="w-64 p-2">
</div>
```

## Styling Override

### Tailwind token mapping (consumer's globals.css)

```css
@source "../node_modules/@polpo-ai/chat/dist/**/*.js";

@theme inline {
  --color-gray-50: var(--my-bg);
  --color-gray-100: var(--my-subtle);
  --color-gray-200: var(--my-border);
  --color-gray-400: var(--my-muted);
  --color-gray-600: var(--my-secondary);
  --color-gray-900: var(--my-foreground);
  --color-blue-500: var(--my-accent);
  --color-green-600: var(--my-success);
}
```

Use `var()` in `@theme inline` so values resolve at runtime — required for dark mode.

### Dark mode

Define CSS vars in `:root` (light) and `[data-theme="dark"]` (dark). Map `@theme inline` tokens to those vars. All package components use tokenized classes (`bg-gray-50`, not `bg-white`), so dark mode works automatically.

### Anti-flash for dark mode

Add inline script in `<head>` to read theme from localStorage before paint:

```tsx
<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html:
      `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()` 
    }} />
  </head>
</html>
```

### Typing animation

Add to consumer's CSS:

```css
@keyframes typing-dot {
  0%, 60%, 100% { opacity: .3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
```

## Custom Tool Renderers

```tsx
import { ToolCallShell } from "@polpo-ai/chat/tools";

function ToolDatabaseQuery({ tool }) {
  return (
    <ToolCallShell tool={tool} icon={Database} label="Query" summary={tool.arguments?.query}>
      <pre>{tool.result}</pre>
    </ToolCallShell>
  );
}
```

## Custom Message Renderer

```tsx
<Chat
  renderMessage={(msg, index, isLast, isStreaming) => (
    <MyCustomMessage msg={msg} isLast={isLast} isStreaming={isStreaming} />
  )}
/>
```

## File URL Resolution

Default file links point to `/api/v1/files/read?path=<file_id>`. Override with `resolveFileUrl`:

```tsx
<ChatMessage
  msg={msg}
  resolveFileUrl={(fileId) => `/my-proxy/files/${encodeURIComponent(fileId)}`}
/>
```
