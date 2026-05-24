# Tool Catalog

50+ built-in tools across 12 categories. Enable via the agent's `allowedTools` field — supports exact names (`browser_navigate`) and category wildcards (`browser_*`), plus the global `"*"`.

When a tool is in `allowedTools`, its docs are auto-injected into the agent's system prompt so the LLM knows the interface.

## Core (always loaded)

| Tool | What it does | Key params |
|---|---|---|
| `read` | Read file (line-numbered) | `path`, `offset?`, `limit?` |
| `write` | Create/overwrite a file | `path`, `content` |
| `edit` | Replace text in a file | `path`, `old_text`, `new_text` |
| `bash` | Run a shell command | `command`, `timeout?` |
| `glob` | Find files by pattern | `pattern`, `path?` |
| `grep` | Search code with regex (PCRE) | `pattern`, `path?`, `include?` |
| `ls` | List a directory | `path` |

Also always loaded:
| `http_fetch` | GET/POST/PUT/DELETE with SSRF guard | `url`, `method?`, `headers?`, `body?` |
| `http_download` | Download file from URL | `url`, `path` |
| `vault_get` | Retrieve a credential | `service`, `key?` |
| `vault_list` | List vault services available | — |

## Browser (18 tools — wildcard `browser_*`)

Powered by `agent-browser`. Session-isolated, profile-persistent (`browserProfile` field on agent).

`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill`, `browser_type`, `browser_press`, `browser_screenshot`, `browser_get`, `browser_select`, `browser_hover`, `browser_scroll`, `browser_wait`, `browser_eval`, `browser_close`, `browser_back`, `browser_forward`, `browser_reload`, `browser_tabs`

Common workflow:
1. `browser_navigate` to URL
2. `browser_snapshot` to inspect ARIA tree
3. `browser_click` / `browser_type` to interact
4. `browser_wait` for async loads
5. `browser_screenshot` for visual verification

## HTTP (2 tools — wildcard `http_*`)

`http_fetch`, `http_download` — already loaded as core.

## Email (8 tools — wildcard `email_*`)

`email_send`, `email_draft`, `email_verify`, `email_list`, `email_read`, `email_search`, `email_count`, `email_download_attachment`

Credentials resolved from vault (entries of type `smtp` and `imap`). Restrict recipients with `emailAllowedDomains`.

## Vault (2 tools — wildcard `vault_*`)

`vault_get`, `vault_list` — already loaded as core. Always returns the agent's own scope only; cross-agent vault access blocked.

## Image & video (3 tools — `image_*` matches 2)

`image_generate` — text → image. Default model: `fal/fal-ai/flux/dev`. Override per-agent with `image_model`.
`image_analyze` — image → text via vision model. Default: `openai/gpt-4o-mini`. Override with `vision_model`.
`video_generate` — text → video. Default: `fal/luma-ray-2-flash`. Override with `video_model`.

**Important quirk**: `image_*` wildcard matches `image_generate` and `image_analyze` only — NOT `video_generate`. To enable all three:
```json
"allowedTools": ["image_*", "video_generate"]
```

## Audio (2 tools — wildcard `audio_*`)

`audio_transcribe` — speech → text. Default: `openai/whisper-1`. Override with `transcribe_model`.
`audio_speak` — text → speech. Default: `openai/tts-1`. Special: `edge/edge-tts` for free local Microsoft Edge voices. Override with `tts_model`.

## Excel (4 tools — wildcard `excel_*`)

`excel_read`, `excel_write`, `excel_query`, `excel_info`

Reads/writes `.xlsx` and `.csv`. `excel_query` runs SQL-like filters.

## PDF (4 tools — wildcard `pdf_*`)

`pdf_read`, `pdf_create`, `pdf_merge`, `pdf_info`

`pdf_create` accepts HTML or markdown input.

## Docx (2 tools — wildcard `docx_*`)

`docx_read`, `docx_create` — Word-compatible .docx files.

## Search (2 tools — wildcard `search_*`)

`search_web` — web search via Exa.
`search_find_similar` — find pages similar to a URL.

Requires `EXA_API_KEY` env var or vault entry under service `exa`.

## Memory (4 tools — wildcard `memory_*`)

Agent-scoped persistent memory. Each agent has its own isolated memory; cross-agent reads are blocked at the runtime.

| Tool | What it does | Notes |
|---|---|---|
| `memory_get` | Read the agent's own memory | Returns "(no memory saved yet)" if empty |
| `memory_save` | Overwrite the entire memory | Use when restructuring; prefer `memory_append` for incremental notes |
| `memory_append` | Append a single timestamped line | Quick notes, observations |
| `memory_update` | Find + replace a substring | `{old_text, new_text}` — old_text must be unique |

Memory tools were added in 0.7.7. They require a MemoryStore + agent name to be present at runtime; the system auto-provides both when the agent runs inside Polpo.

## Wildcard expansion summary

| Pattern | Expands to | Count |
|---|---|---|
| `browser_*` | all browser tools | 18 |
| `email_*` | all email tools | 8 |
| `image_*` | `image_generate`, `image_analyze` (NOT `video_generate`) | 2 |
| `audio_*` | `audio_transcribe`, `audio_speak` | 2 |
| `excel_*` | all excel tools | 4 |
| `pdf_*` | all pdf tools | 4 |
| `docx_*` | all docx tools | 2 |
| `search_*` | `search_web`, `search_find_similar` | 2 |
| `memory_*` | all 4 memory tools | 4 |
| `vault_*` | `vault_get`, `vault_list` | 2 |
| `http_*` | `http_fetch`, `http_download` | 2 |
| `*` | every built-in tool + MCP tools | 50+ |

## Tool selection recipes

### Research agent
```json
"allowedTools": [
  "read","write","glob","grep",
  "http_*","search_*","browser_*",
  "pdf_*","excel_*",
  "memory_*"
]
```

### Coding agent
```json
"allowedTools": [
  "read","write","edit","bash","glob","grep","ls",
  "http_fetch",
  "memory_*"
]
```
Pair with strict `allowedPaths` to keep it sandboxed.

### Customer support agent
```json
"allowedTools": [
  "read","write",
  "email_*",
  "search_web",
  "memory_*"
]
```
Pair with `emailAllowedDomains: ["yourcompany.com"]`.

### Content creator agent
```json
"allowedTools": [
  "read","write",
  "image_*","video_generate",
  "audio_speak",
  "pdf_create","docx_create",
  "browser_navigate","browser_screenshot",
  "http_*"
]
```

### Data processing agent
```json
"allowedTools": [
  "read","write","bash",
  "excel_*","pdf_*","docx_*",
  "http_*"
]
```

## Common pitfalls

- **`image_*` doesn't include `video_generate`** — add it explicitly.
- **Tool requires a vault entry that doesn't exist** — `audio_speak` with OpenAI needs `openai` API key; `search_web` needs `exa`. Create the vault entry first (see `vault.md`).
- **Wildcards on untrusted agents** — `["*"]` exposes every tool including `email_send`. Use the minimum needed.
- **No `browserProfile`** — browser tools work but lose cookies/localStorage between runs. Set `browserProfile` for stateful flows.
- **MCP tool not in catalog** — MCP tools are namespaced `mcp__<server>__<tool>` and must be listed individually in `allowedTools` (no wildcard).
