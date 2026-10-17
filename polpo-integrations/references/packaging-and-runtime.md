# Packaging And Runtime

## Multi-File Tools

A tool in `.polpo/tools/` may import other local TypeScript files. `polpo deploy` and
`polpo tools push` bundle every file the tool imports, so:

- keep imported files inside the project and use relative paths; imports that leave the tool's
  root are rejected;
- match file-name case exactly (`./Utils` and `./utils` differ on Linux);
- use static imports; dynamic imports that cannot be resolved ahead of time fail packaging;
- list npm packages as dependencies instead of importing from a sibling app's `node_modules`.

Packaging errors are reported before anything is uploaded. Fix them there; do not deploy and wait
for a runtime error to show what was missing.

Do not import code from your web app (for example a Next.js page) into a tool. The tool runs in a
sandbox with only its own bundle and dependencies.

## Files And Workspace

Write files under `ctx.workDir`, the tool's writable workspace. Do not hard-code home
directories such as `/home/daytona`. Mounted volumes may be mount points: to reset one, delete
its contents rather than the mount directory itself.

## Errors

Throw an `Error` with a clear message for expected failures (bad input, upstream 4xx). The
runtime turns failures into stable errors for package load, schema validation, missing binding,
Connection resolution, timeout, cancellation, and result serialization, with a correlation ID you
can quote when debugging. Never include credentials or raw secrets in error messages or results.
