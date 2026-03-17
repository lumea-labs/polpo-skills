---
name: polpo-cloud
description: Deploy and manage AI agents on Polpo Cloud using the CLI. Use when the user wants to deploy agents, manage API keys, configure LLM provider keys (BYOK), check project status, or any Polpo Cloud infrastructure task. Triggers on "polpo deploy", "polpo cloud", "polpo-cloud CLI", "deploy agent", "BYOK", "LLM keys", "polpo login".
---

# Polpo Cloud CLI

## Install

```bash
npm install -g @polpo-cloud/cli
```

## Authentication

```bash
# Login with API key (get from cloud.polpo.sh → API Keys)
polpo-cloud login
# Enter: API key, base URL (https://api.polpo.sh), project ID

# Verify
polpo-cloud status

# Logout
polpo-cloud logout
```

Credentials stored at `~/.polpo-cloud/credentials.json`.

## Deploy Agents

Deploy syncs local `.polpo/` config to the cloud project.

```bash
# From project root (must have .polpo/ directory)
polpo-cloud deploy
```

This uploads:
- Agent configurations (from `polpo.json` or `.polpo/config.json`)
- Skills
- Memory

## BYOK (Bring Your Own Key)

Set LLM provider API keys per project. Keys are AES-256-GCM encrypted at rest.

```bash
# Set a key
polpo-cloud byok set --provider xai --key "xai-..."
polpo-cloud byok set --provider openai --key "sk-..."
polpo-cloud byok set --provider anthropic --key "sk-ant-..."

# List keys (masked)
polpo-cloud byok list
```

Supported providers: `openai`, `anthropic`, `xai`, `google`, `groq`, `openrouter`, `cerebras`, `mistral`.

## Project Management

```bash
# List projects
polpo-cloud projects

# View project status
polpo-cloud status
```

## Stream Logs

```bash
# Stream real-time logs from the project
polpo-cloud logs
```

## Workflow: First Deploy

1. Sign up at `cloud.polpo.sh`
2. Create a project in the dashboard
3. Create an API key (copy it — shown once)
4. `polpo-cloud login` with the API key
5. `polpo-cloud byok set --provider xai --key "xai-..."` (or your LLM provider)
6. Create agents via API or dashboard
7. Use `POST /v1/chat/completions` with `agent: "name"` to chat

## Cloud Dashboard

Available at `cloud.polpo.sh` after signup:
- **Overview**: project stats
- **Agents**: view/manage agent configs
- **Sessions**: chat history with agents
- **Skills**: installed agent skills
- **Memory**: project + per-agent memory
- **Webhooks**: event notification endpoints
- **API Keys**: manage data plane keys
- **LLM Keys**: BYOK provider keys (global, per-project)
- **Settings**: project configuration

## API Base URL

- **Cloud**: `https://api.polpo.sh`
- **Self-hosted**: `http://localhost:3000` (default `polpo serve` port)

See [references/cli-commands.md](references/cli-commands.md) for the full CLI reference.
