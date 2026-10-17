# Development And Production In React

Requires `@polpo-ai/react` `0.17.3` or later and a host with environments.

```tsx
<PolpoProvider baseUrl="/api/polpo" apiPrefix="/v1" environment="production">
  {children}
</PolpoProvider>
```

- Without `environment`, the provider uses whatever the key and URL point to; it does not
  default to Development.
- Changing `environment`, `baseUrl`, `apiKey`, `apiPrefix`, or `fetch` rebuilds the client and
  store and remounts the children. Keep a custom `fetch` stable (define it outside the component
  or memoize it) so ordinary renders do not reset the chat.
- Two providers can target the two environments at the same time.

If your app lets people switch environment:

- keep the choice in the URL or tab state, not a global cookie that would redirect another tab;
- on a switch, clear the selected Session, open dialogs, and unsent drafts;
- ignore late responses from the old environment, and never continue an old run (tool result,
  steering, cancel) through the new provider.

With the server proxy pattern, the proxy holds one key per environment and must forward to the
matching one; never expose either key to the browser.
