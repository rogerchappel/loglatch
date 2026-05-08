# LogLatch

LogLatch is a local-first TypeScript CLI for catching the useful failure evidence before the terminal scrollback turns into soup.

It scans local logs, redacts obvious secrets, groups repeated warnings/errors/fatals into stable buckets, and renders Markdown or JSON triage reports you can paste into an issue, attach to CI, or hand to an agent without leaking the sharp bits.

No accounts. No telemetry. No surprise network calls. Just a small latch for noisy logs.

## Quick start

```bash
npm install
npm run build
node dist/cli.js scan examples/failing-test.log --out triage.md --fail-on none
```

After install from npm or a local package link, use the binary directly:

```bash
loglatch scan examples/failing-test.log --out triage.md
loglatch scan "logs/*.log" --json --fail-on fatal
```

## What it does

- reads plain text and JSON/JSONL-style log files from paths or simple globs
- redacts common secrets by default (`api_key=...`, GitHub tokens, bearer tokens, private keys, URL passwords)
- infers severity from structured fields or common text patterns
- clusters warning/error/fatal lines by normalized failure fingerprint
- keeps source file and line evidence for each bucket
- writes deterministic Markdown or JSON reports
- exits non-zero when `--fail-on` thresholds are reached

## CLI

```bash
loglatch scan <files...> [--out <path>] [--json] [--markdown] [--fail-on <level>] [--no-redact]
loglatch examples
loglatch --help
```

Options:

- `--out <path>`: write the report to a file instead of stdout
- `--json`: render JSON
- `--markdown`: render Markdown (default)
- `--fail-on <none|warn|error|fatal>`: exit 1 when a bucket reaches the threshold; default is `fatal`
- `--redact`: redact common secrets (default)
- `--no-redact`: preserve input text; useful only for trusted local debugging
- `--max-evidence <n>`: evidence lines per bucket; default is `5`

## Examples

```bash
# Markdown report, never fail the shell
loglatch scan examples/failing-test.log --out triage.md --fail-on none

# JSON report for CI; exits 1 if fatal buckets exist
loglatch scan examples/*.log examples/*.jsonl --json --fail-on fatal

# Triage warnings and above as a local quality gate
loglatch scan "logs/**/*.log" --fail-on warn
```

## Safety model

LogLatch is built for private local evidence:

- runtime has no network calls
- redaction is enabled by default
- it reads only files you pass on the command line
- it writes only stdout or the explicit `--out` path
- fixtures in this repo contain fake secrets only

Redaction is a guardrail, not magic. Review reports before sharing them publicly, especially if your logs contain unusual credential formats or sensitive customer data.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

A real CLI smoke with checked-in fixtures:

```bash
npm run build
node dist/cli.js scan examples/failing-test.log --out /tmp/loglatch-triage.md --fail-on none
```

## Project docs

- [PRD](docs/PRD.md)
- [Tasks](docs/TASKS.md)
- [Orchestration](docs/ORCHESTRATION.md)
- [Machine-readable orchestration](docs/orchestration.json)

## Limitations

- Glob support is intentionally small and dependency-free.
- Bucketing is deterministic heuristic clustering, not semantic AI analysis.
- Markdown/JSON are the only V1 output formats.
- `generatedAt` is fixed for deterministic local outputs in this MVP.

## Contributing

Small, fixture-backed patches are very welcome. Please keep the local-first contract intact: no telemetry, no hidden uploads, no checked-in real logs, and no surprise writes outside explicit outputs.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## License

MIT © Roger Chappel
