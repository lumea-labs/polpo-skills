# Theming Reference

## How it works

All components use neutral Tailwind gray classes (`bg-gray-50`, `text-gray-900`, `border-gray-200`). Override by mapping your palette to the gray scale.

## Color Mapping (Tailwind v4)

```css
@theme inline {
  --color-gray-50: var(--my-bg);
  --color-gray-100: var(--my-subtle);
  --color-gray-200: var(--my-border);
  --color-gray-400: var(--my-muted);
  --color-gray-600: var(--my-secondary);
  --color-gray-900: var(--my-foreground);
  --color-blue-500: var(--my-accent);
  --color-green-600: var(--my-success);
}
```

Use `var()` in `@theme inline` — resolves at runtime, required for dark mode.

## Dark Mode

### Class-based (Tailwind standard)
```css
:root { --my-bg: #FAFAF7; --my-border: #E5E1DA; --my-foreground: #111; }
.dark { --my-bg: #0F0F0F; --my-border: #2A2A2A; --my-foreground: #EEE; }
```

### Attribute-based
```css
:root { /* light */ }
[data-theme="dark"] { /* dark */ }
```

### Anti-flash script (prevents light→dark flash on load)
```tsx
<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html:
      `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.classList.add(t)}catch(e){}})()` 
    }} />
  </head>
</html>
```

## Fonts

Components inherit fonts. Set on body:
```css
body { font-family: 'Inter', sans-serif; }
```

## Tailwind Content Scanning (npm only, not needed for CLI install)

```css
/* Tailwind v4 */
@source "../node_modules/@polpo-ai/chat/dist/**/*.js";
```

```js
// Tailwind v3
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./node_modules/@polpo-ai/chat/dist/**/*.js",
  ],
}
```
