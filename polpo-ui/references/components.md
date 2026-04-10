# Component Props Reference

## `<Chat>`

```tsx
<Chat
  sessionId?: string           // Existing session (omit for new)
  agent?: string               // Agent name
  onSessionCreated?: (id) => void  // Callback when session created
  onUpdate?: () => void        // After each stream update
  renderMessage?: (msg, index, isLast, isStreaming) => ReactNode
  avatar?: ReactNode           // Assistant avatar
  agentName?: string           // Assistant display name
  streamdownComponents?: Record<string, unknown>
  skeletonCount?: number       // Loading skeleton count (default: 3)
  inputPlaceholder?: string    // Default input placeholder
  inputHint?: string           // Hint below default input
  allowAttachments?: boolean   // Enable file attach (default: true)
  className?: string
  ref?: Ref<ChatMessagesHandle>
>
  {children}                   // ReactNode or (ctx: { hasMessages }) => ReactNode
</Chat>
```

## `<ChatInput>`

```tsx
<ChatInput
  placeholder?: string        // Default: "Type a message…"
  hint?: string               // Text below input
  allowAttachments?: boolean   // Default: true
  className?: string
  renderSubmit?: (props: { isStreaming, onStop }) => ReactNode
/>
```

Must be inside `<ChatProvider>` or `<Chat>`.

## `<ChatMessage>`

```tsx
<ChatMessage
  msg: ChatMessageItemData     // { id?, role, content, ts?, toolCalls? }
  isLast?: boolean
  isStreaming?: boolean
  avatar?: ReactNode
  agentName?: string
  streamdownComponents?: Record<string, unknown>
  resolveFileUrl?: (fileId: string) => string  // Default: /api/v1/files/read?path=...
  className?: string
/>
```

Dispatches to `ChatUserMessage` or `ChatAssistantMessage` by role.

## `<ChatMessages>`

```tsx
<ChatMessages
  renderItem?: (msg, index, isLast, isStreaming) => ReactNode
  className?: string
  skeletonCount?: number       // Default: 3
  ref?: Ref<ChatMessagesHandle>  // { scrollToBottom(behavior?) }
/>
```

Virtuoso-powered. Must be inside `<ChatProvider>`.

## `<ChatSessionList>`

```tsx
<ChatSessionList
  sessions: ChatSession[]      // From useSessions()
  agents?: AgentConfig[]       // From useAgents()
  activeSessionId?: string | null
  onSelect: (sessionId) => void
  onDelete?: (sessionId) => void  // Omit to hide delete
  isLoading?: boolean
  emptyMessage?: string
  className?: string
  renderAvatar?: (agent, agentName) => ReactNode
/>
```

## `<ChatSessionsByAgent>`

```tsx
<ChatSessionsByAgent
  sessions: ChatSession[]
  agents?: AgentConfig[]
  onSelect: (agentName) => void
  isLoading?: boolean
  emptyMessage?: string
  className?: string
  renderAvatar?: (agent, agentName) => ReactNode
/>
```

## `<ChatAgentSelector>`

```tsx
<ChatAgentSelector
  agents: AgentConfig[] | undefined
  selected: string | undefined
  onSelect: (agentName) => void
  fallbackLabel?: string       // Default: "Select agent"
  renderAvatar?: (agent, size) => ReactNode
  className?: string
/>
```

## `<ChatSuggestions>`

```tsx
<ChatSuggestions
  suggestions: { icon?: ReactNode, text: string }[]
  onSelect: (text) => void
  columns?: 1 | 2 | 3         // Default: 2
  className?: string
/>
```

## `<ChatAskUser>`

```tsx
<ChatAskUser
  questions: { id, question, header?, options?, multiple?, custom? }[]
  onSubmit: (answers: { questionId, selected: string[] }[]) => void
  disabled?: boolean
/>
```

Single question = flat layout. Multiple = wizard with tabs + summary.

## `<ChatLanding>`

```tsx
<ChatLanding
  agent?: string
  onSessionCreated?: (id) => void
  greeting?: string            // Default: "How can I help you?"
  subtitle?: string
  suggestions?: ChatSuggestion[]
  suggestionColumns?: 1 | 2 | 3
  inputPlaceholder?: string
  inputHint?: string
  allowAttachments?: boolean
  header?: ReactNode
  className?: string
/>
```

Wraps its own `<ChatProvider>`.

## `<ChatScrollButton>`

```tsx
<ChatScrollButton
  isAtBottom: boolean
  showNewMessage?: boolean
  onClick: () => void
  className?: string
/>
```

## `<ChatSkeleton>`

```tsx
<ChatSkeleton count?: number />  // Default: 3
```

## `<ChatTyping>`

```tsx
<ChatTyping className?: string />
```

Requires `@keyframes typing-dot` in consumer CSS.
