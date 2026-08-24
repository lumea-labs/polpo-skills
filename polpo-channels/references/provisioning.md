# Provisioning And CLI

Use the management service consistently across API, SDK, CLI, MCP, and dashboard.

```bash
polpo channels providers
polpo channels list --provider whatsapp
polpo channels get CHANNEL_ID

polpo channels add whatsapp \
  --agent leo \
  --connection conn_whatsapp \
  --destination PHONE_NUMBER_ID

polpo channels setup-status SETUP_ID
polpo channels test CHANNEL_ID --to 15551234567

polpo channels routes list CHANNEL_ID
polpo channels routes add CHANNEL_ID --agent leo --priority 100
polpo channels routes remove CHANNEL_ID ROUTE_ID
polpo channels remove CHANNEL_ID
```

Do not use `channels update --status active` to bypass provider setup. Activation is valid only
after the management service has recorded successful provider verification; an unverified update
must fail with provider action required.

Use repeated `--allowed-tool` on Channel creation or Route creation to narrow the current Channel
turn. Use identity resolver options when application identity must be resolved before execution:

```bash
polpo channels add whatsapp \
  --agent leo \
  --connection conn_whatsapp \
  --destination PHONE_NUMBER_ID \
  --identity-resolver-endpoint https://app.example.com/polpo/channel-identity \
  --identity-resolver-connection conn_resolver \
  --identity-resolver-timeout 3000
```

Provisioning is idempotent. A destination conflict must be detected before leaving an unrelated
pending Channel/Route, or the response must provide an explicit recoverable resource state.

Provider setup may return `setup_required` or `pending_external`. Surface the exact callback URL,
verification action, and setup status. A record existing in the database is not equivalent to a
live provider installation.

Use `--json` for agentic callers. Destructive operations require confirmation or `--yes` in
non-interactive environments.
