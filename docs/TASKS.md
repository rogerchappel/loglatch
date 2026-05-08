# LogLatch task plan

## Wave 1 — Scaffold and package

- [x] Generate the repository with StackForge `oss-cli`.
- [x] Copy the source PRD to `docs/PRD.md`.
- [x] Configure TypeScript, package metadata, and CLI entrypoint.

## Wave 2 — Core MVP

- [x] Load local files and simple globs without network calls.
- [x] Redact common token, password, key, bearer, and URL credential patterns by default.
- [x] Parse plain text and JSONL-style structured logs.
- [x] Infer severities and cluster warning/error/fatal lines into deterministic buckets.
- [x] Render Markdown and JSON triage reports.
- [x] Support fatal/error/warn/none quality gates through `--fail-on`.

## Wave 3 — Evidence and safety

- [x] Preserve file and line evidence for every bucket.
- [x] Keep output deterministic for tests and review.
- [x] Avoid telemetry, hidden file writes, and external calls.
- [x] Document limitations and safety model.

## Wave 4 — Validation

- [x] Add checked-in fixtures under `examples/`.
- [x] Add unit tests for redaction, parsing, clustering, and scan reports.
- [x] Add CLI smoke coverage using checked-in fixtures.
- [x] Keep `scripts/validate.sh` as the local verification umbrella.

## Release-readiness follow-ups

- [ ] Add more language/framework-specific recognizers after real-world dogfood.
- [ ] Add SARIF or GitHub Step Summary output if users ask for CI-native formats.
- [ ] Consider configurable redaction patterns while keeping safe defaults.
