# Polpo Cloud CLI Commands

## polpo-cloud login

Authenticate with the cloud API.

```bash
polpo-cloud login
# Interactive: prompts for API key, base URL, project ID

# Non-interactive
polpo-cloud login --api-key sk_live_... --url https://api.polpo.sh --project <id>
```

## polpo-cloud logout

Clear stored credentials.

```bash
polpo-cloud logout
```

## polpo-cloud status

Show project status: agents, tasks, connection info.

```bash
polpo-cloud status
```

## polpo-cloud deploy

Sync local `.polpo/` configuration to the cloud project.

```bash
polpo-cloud deploy
```

Uploads agent configs, skills, and memory from the local `.polpo/` directory.

## polpo-cloud byok set

Set an LLM provider API key for the project.

```bash
polpo-cloud byok set --provider <name> --key <api-key> [--label <label>]
```

Providers: `openai`, `anthropic`, `xai`, `google`, `groq`, `openrouter`, `cerebras`, `mistral`.

## polpo-cloud byok list

List configured LLM keys (masked).

```bash
polpo-cloud byok list
```

## polpo-cloud projects

List projects in the organization.

```bash
polpo-cloud projects
```

## polpo-cloud logs

Stream real-time logs from the project.

```bash
polpo-cloud logs
```

## Credential Storage

Credentials are stored at `~/.polpo-cloud/credentials.json`:

```json
{
  "apiKey": "sk_live_...",
  "baseUrl": "https://api.polpo.sh",
  "projectId": "bdf1341b-..."
}
```
