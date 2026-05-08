# Local-first contract

LogLatch exists for developers and agents that need to summarize evidence without sending logs to a service.

## Runtime promises

- no telemetry
- no external network calls
- no background daemon
- no config file writes
- no mutation of scanned inputs
- no output file unless `--out` is provided

## Dependency posture

The MVP intentionally uses only Node built-ins at runtime. Development dependencies are limited to TypeScript and Node types.

## Handling real logs

Real logs often contain secrets, names, hostnames, paths, and customer data. Keep them out of the repository. Prefer adding minimal synthetic fixtures that reproduce parser behavior without preserving sensitive content.
