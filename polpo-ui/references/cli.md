# CLI Reference

## create-polpo-app

Scaffold a complete Polpo app from a starter template.

### Interactive
```bash
npx create-polpo-app
```
Prompts for project name and template selection.

### Non-interactive
```bash
npx create-polpo-app <name> [options]

Options:
  -t, --template <name>   Template (default: chat)
  -y, --yes               Skip prompts
  --skip-install           Skip npm install
  -h, --help              Show help
  --list                  List templates
```

### Templates

| Template | Description |
|----------|-------------|
| `chat` | Full-page chat, sidebar, sessions, dark/light mode |
| `chat-widget` | Floating/embedded support widget, multiple variants |
| `multi-agent` | Multi-agent workspace, grouped sessions |

### Examples
```bash
npx create-polpo-app my-chat                          # interactive
npx create-polpo-app my-chat -t chat -y               # non-interactive
npx create-polpo-app my-widget -t chat-widget -y      # widget
npx create-polpo-app my-workspace -t multi-agent -y   # multi-agent
npx create-polpo-app my-app -y --skip-install         # no install
```

## @polpo-ai/ui

Add components to an existing project (shadcn-style, copies source). Requires `shadcn` initialized.

### Interactive
```bash
npx @polpo-ai/ui add
```
Multi-select with checkboxes. Space to toggle, Enter to confirm.

### Non-interactive
```bash
npx @polpo-ai/ui add --all                    # everything
npx @polpo-ai/ui add <component> [...]        # specific parts
npx @polpo-ai/ui add --all --overwrite        # overwrite existing

Options:
  --all              Install all components
  --overwrite        Overwrite existing files
```

### Available components
```bash
npx @polpo-ai/ui list
```

| Component | What it installs |
|-----------|-----------------|
| `chat` | Everything (29 files) |
| `lib` | relativeTime, getTextContent |
| `hooks` | useSubmitHandler, useDocumentDrag |
| `tools` | 9 tool renderers |
| `message` | ChatMessage, ChatTyping |
| `streamdown` | Code block override |

### Examples
```bash
npx @polpo-ai/ui add                         # interactive picker
npx @polpo-ai/ui add --all                   # install everything
npx @polpo-ai/ui add tools hooks             # specific parts
npx @polpo-ai/ui add --all --overwrite       # force update
```

## Frameworks

All CLIs work with: Next.js, Vite, Remix, React Router, Astro, TanStack, Laravel.
The `"use client"` directives are used by Next.js and ignored by other frameworks.
