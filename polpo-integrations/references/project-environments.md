# Connections In Development And Production

On a Cloud project with environments, Connections, OAuth accounts, credentials, and agent grants
belong to one environment. A new Production environment starts without Development's accounts
or grants; connect and grant them again there. Catalog entries and a managed OAuth app can be
shared, but an authorized account is not.

- CLI: `polpo connections ...` targets Development; add `--prod` for Production. Organization
  OAuth app commands (`connections oauth-clients ...` with `--organization`) are not per
  environment and reject the flag.
- SDK: `new PolpoConnectClient({ ..., environment: "production" })`. The option applies to API,
  MCP, OAuth, setup, and gateway calls and cannot be changed later. Without it, the key and URL
  decide. An organization-level client must not set an environment.
- Grants are per agent per environment; giving `support` access in Development does not give the
  Production `support` agent anything.
- Your app's end-user subject and tenant are unrelated to the environment. Keep passing them as
  before.

An OAuth flow finishes in the environment where it started, even if the user switches
environment in your UI before the callback. Start setup sessions from a backend client created
for the intended environment, and do not derive the environment from a return URL.

Requires Polpo `0.17.3` or later and a Cloud project moved to environments.
