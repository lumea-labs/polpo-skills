# Polpo Tool Catalog

58 tools across 10 categories. Assign via `allowedTools` in agent config.
Glob patterns supported: `"browser_*"` assigns all 17 browser tools.

## Coding Tools (6)
| Tool | Description |
|------|-------------|
| `bash` | Execute shell commands in sandboxed environment |
| `read` | Read file contents with line numbers |
| `write` | Create or overwrite a file |
| `edit` | Search-and-replace within a file (regex-style) |
| `glob` | Find files matching a glob pattern |
| `grep` | Search file contents with regex |

## File & HTTP Tools (4)
| Tool | Description |
|------|-------------|
| `ls` | List directory contents |
| `http_fetch` | HTTP GET, returns JSON or text |
| `http_download` | Download HTTP response to a file |
| `register_outcome` | Declare task deliverables (files created/edited) |

## PDF Tools (4) — `"pdf_*"`
| Tool | Description |
|------|-------------|
| `pdf_read` | Extract text from PDF pages |
| `pdf_create` | Create a PDF from text/HTML |
| `pdf_merge` | Merge multiple PDFs into one |
| `pdf_info` | Get PDF metadata (pages, size, etc.) |

## Excel Tools (4) — `"excel_*"`
| Tool | Description |
|------|-------------|
| `excel_read` | Read spreadsheet data (sheets, cells, ranges) |
| `excel_write` | Create or modify spreadsheets |
| `excel_query` | Query spreadsheet data with SQL-like syntax |
| `excel_info` | Get workbook metadata (sheets, dimensions) |

## DOCX Tools (2) — `"docx_*"`
| Tool | Description |
|------|-------------|
| `docx_read` | Extract text and structure from Word documents |
| `docx_create` | Create Word documents from content |

## Email Tools (8) — `"email_*"`
Requires vault credentials (SMTP/IMAP). Respects `emailAllowedDomains`.

| Tool | Description |
|------|-------------|
| `email_send` | Send an email (text or HTML) |
| `email_draft` | Create a draft without sending |
| `email_verify` | Verify an email address is deliverable |
| `email_list` | List emails in a mailbox folder |
| `email_read` | Read a specific email by ID |
| `email_search` | Search emails by query |
| `email_count` | Count emails matching criteria |
| `email_download_attachment` | Save an email attachment to disk |

## Phone Tools (7) — `"phone_*"`
Requires vault credentials for telephony provider.

| Tool | Description |
|------|-------------|
| `phone_call` | Initiate an outbound phone call |
| `phone_hangup` | End an active call |
| `phone_list_calls` | List recent calls |
| `phone_get_call` | Get details of a specific call |
| `phone_setup_inbound` | Configure inbound call handling |
| `phone_get_inbound_config` | Read current inbound config |
| `phone_disable_inbound` | Disable inbound call handling |

## Media Tools (5)
| Tool | Pattern | Description |
|------|---------|-------------|
| `image_generate` | `"image_*"` | Generate images from text prompts |
| `image_analyze` | `"image_*"` | Analyze/describe images (vision) |
| `video_generate` | — | Generate video from prompts |
| `audio_transcribe` | `"audio_*"` | Speech-to-text transcription |
| `audio_speak` | `"audio_*"` | Text-to-speech synthesis |

## Search Tools (2) — `"search_*"`
| Tool | Description |
|------|-------------|
| `search_web` | Web search (returns structured results) |
| `search_find_similar` | Find semantically similar content |

## Agent System Tools (6)
| Tool | Pattern | Description |
|------|---------|-------------|
| `vault_get` | always available | Get credentials for a service from the vault |
| `vault_list` | always available | List available vault entries (metadata only) |
| `memory_get` | `"memory_*"` | Read project or agent memory |
| `memory_save` | `"memory_*"` | Overwrite memory content |
| `memory_append` | `"memory_*"` | Append a timestamped line to memory |
| `memory_update` | `"memory_*"` | Find and replace text in memory |

## Browser Tools (17) — `"browser_*"`
Full Playwright-powered browser automation. Supports persistent profiles via `browserProfile`.

| Tool | Description |
|------|-------------|
| `browser_navigate` | Go to a URL |
| `browser_back` | Navigate back |
| `browser_forward` | Navigate forward |
| `browser_reload` | Reload current page |
| `browser_click` | Click an element (by selector or text) |
| `browser_hover` | Hover over an element |
| `browser_type` | Type text into an element |
| `browser_fill` | Fill a form field |
| `browser_press` | Press a keyboard key |
| `browser_select` | Select a dropdown option |
| `browser_scroll` | Scroll the page or element |
| `browser_screenshot` | Take a screenshot |
| `browser_snapshot` | Get the DOM snapshot (accessibility tree) |
| `browser_get` | Get page content (HTML/text) |
| `browser_eval` | Execute JavaScript in page context |
| `browser_wait` | Wait for selector/condition |
| `browser_tabs` | List open tabs |
| `browser_close` | Close a tab |

## Typical Tool Profiles

**Coding agent:** `["bash", "read", "write", "edit", "glob", "grep"]`
**Research agent:** `["read", "grep", "glob", "search_web", "http_fetch"]`
**Email agent:** `["email_*", "read", "write"]` + vault SMTP creds
**Browser agent:** `["browser_*", "read", "write", "bash"]`
**Full-stack agent:** `["bash", "read", "write", "edit", "glob", "grep", "http_fetch", "search_web"]`

Source: `packages/tools/src/*-tools.ts`, `packages/tools/src/index.ts`
