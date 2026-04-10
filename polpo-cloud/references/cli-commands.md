# Polpo Cloud CLI Commands

## polpo login

Authenticate with Polpo Cloud.

```bash
# Interactive — opens browser for approval (recommended)
polpo login

# Non-interactive — pass API key directly
polpo login --api-key sk_live_...

# Or via environment variable
export POLPO_API_KEY=sk_live_...
polpo login
```

Get your key from polpo.sh → API Keys.

## polpo logout

Clear stored credentials.

```bash
polpo logout
```

## polpo cloud-status

Show cloud project status: agents, tasks, connection info.

```bash
polpo cloud-status
```

## polpo deploy

Sync local `.polpo/` configuration to the cloud project. Creates the project automatically on first deploy if none is linked.

```bash
polpo deploy [--dir .] [--yes] [--include-tasks] [--include-sessions] [--all]
```

Uploads agent configs, skills, and memory from the local `.polpo/` directory.

## polpo byok set

Set an LLM provider API key for the project. Optional — the managed gateway provides free credits by default.

```bash
# Interactive — prompts securely for the key value
polpo byok set <provider>

# Non-interactive — pass key via flag
polpo byok set <provider> --key <api-key>
```

Examples:
```bash
polpo byok set xai --key "xai-..."
polpo byok set anthropic --key "sk-ant-..."
polpo byok set openai --key "sk-..."
```

Providers: `openai`, `anthropic`, `xai`, `google`, `groq`, `openrouter`, `cerebras`, `mistral`, `gateway`.

You can also set keys via the dashboard at polpo.sh → LLM Keys.

## polpo byok list

List configured LLM keys (masked).

```bash
polpo byok list
```

## polpo byok delete

Remove a provider key.

```bash
polpo byok delete <provider>
```

## polpo projects list

List projects in the organization.

```bash
polpo projects list
```

## polpo projects create

Create a new project.

```bash
polpo projects create <name>
```

## polpo cloud-logs

Stream real-time logs from the project.

```bash
polpo cloud-logs [--follow] [--tail 50]
```

## Credential Storage

Credentials are stored locally at `~/.polpo/credentials.json`. Never commit this file to version control.
