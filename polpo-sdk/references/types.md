# Polpo SDK Types

## Chat Completions

```typescript
interface ChatCompletionRequest {
  messages: ChatCompletionMessage[];
  agent?: string;           // Target agent name (required for cloud)
  stream?: boolean;         // Enable SSE streaming
  sessionId?: string;       // Continue existing session
  model?: string;           // Ignored — agent's model is used
}

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];  // String or multimodal (text + images)
}

interface ChatCompletionResponse {
  id: string;               // "chatcmpl-..."
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

interface ChatCompletionChoice {
  index: number;
  message: { role: "assistant"; content: string };
  finish_reason: "stop" | "length" | "ask_user" | "mission_preview";
}

// Streaming chunk
interface ChatCompletionChunk {
  id: string;
  object: "chat.completion.chunk";
  choices: Array<{ index: number; delta: { role?: string; content?: string }; finish_reason: string | null }>;
}
```

## Agent

```typescript
interface AgentConfig {
  name: string;
  role?: string;
  model?: string;                    // "provider:model" e.g. "xai:grok-4-fast"
  allowedTools?: string[];           // ["bash", "read", "write", "edit", "glob", "grep"]
  systemPrompt?: string;
  skills?: string[];
  maxTurns?: number;
  maxConcurrency?: number;
  reasoning?: ReasoningLevel;        // "off" | "minimal" | "low" | "medium" | "high" | "xhigh"
  identity?: AgentIdentity;
  reportsTo?: string;
  volatile?: boolean;
}

interface AgentIdentity {
  displayName?: string;
  title?: string;
  bio?: string;
  timezone?: string;
  avatar?: string;
  responsibilities?: (string | AgentResponsibility)[];
  tone?: string;
  personality?: string;
  socials?: Record<string, string>;
}
```

## Session

```typescript
interface ChatSession {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  agent?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
  toolCalls?: ToolCallEvent[];
}
```

## Task

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  assignTo: string;
  status: "draft" | "pending" | "assigned" | "in_progress" | "review" | "done" | "failed";
  dependsOn: string[];
  expectations: TaskExpectation[];
  result?: TaskResult;
  createdAt: string;
  updatedAt: string;
}
```

## Mission

```typescript
interface Mission {
  id: string;
  name: string;
  data: string;          // JSON string with tasks, checkpoints, delays
  prompt?: string;
  status: "draft" | "active" | "completed" | "failed" | "paused";
  executionCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

## Model Format

Models use `provider:model` format:
- `xai:grok-4-fast`
- `anthropic:claude-sonnet-4-5`
- `openai:gpt-4o`
- `google:gemini-2.0-flash`
- `groq:llama-3.3-70b-versatile`
