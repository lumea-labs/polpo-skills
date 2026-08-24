# Packaging And Runtime

Custom tools may import project-local TypeScript modules. Deployment must resolve and upload the
complete relative dependency graph rather than only the entry file.

## Packaging Rules

- include reachable local source files with stable POSIX-relative paths;
- reject imports escaping the tool root;
- classify package dependencies separately from local files;
- detect missing files, dynamic unsupported imports, case mismatches, cycles, and oversized
  bundles before upload;
- preserve source and bundle metadata independently;
- build the runtime snapshot with the same `@polpo-ai/tools` contract used by the deployed CLI.

Do not include dashboard or unrelated Next.js application code in a custom-tool runtime image.
The runner must resolve its runtime dependencies in the production sandbox, not from a developer
workspace.

## Filesystem

`ctx.workDir` is the authorized writable workspace. Do not create hard-coded home directories or
assume `/home/daytona` itself is writable. Mounted paths may be mount points: delete their
contents when resetting a workspace rather than removing the mount root.

## Runtime Failure Contract

Return stable errors for package load, schema validation, missing binding, Connection resolution,
timeout, cancellation, execution, and result serialization. Preserve the internal correlation ID
and safe diagnostic while redacting source secrets and credentials.
