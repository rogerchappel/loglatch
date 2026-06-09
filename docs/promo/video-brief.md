# LogLatch Video Brief

## Angle

Show a local-first workflow for converting noisy logs into a shareable triage
report with redaction and deterministic buckets.

## 60-second outline

1. Open `examples/failing-test.log` and show that the input is a local file.
2. Run `node dist/src/cli.js scan examples/failing-test.log --out
   /tmp/loglatch-demo/triage.md --fail-on none`.
3. Open the Markdown report and show severity buckets plus source line evidence.
4. Run the JSON variant for automation:
   `node dist/src/cli.js scan examples/failing-test.log --json --fail-on none`.
5. Close with the safety model: no network calls, explicit inputs, explicit
   output path, redaction on by default.

## Social hooks

- Turn a failing test log into a Markdown triage report before the scrollback is
  gone.
- `loglatch scan examples/failing-test.log --out triage.md` groups local log
  failures and redacts common secrets by default.
- Markdown for handoff, JSON for automation, and `--fail-on` when the scan
  should act as a local gate.

## Guardrails

- Redaction is a guardrail, not a guarantee; review reports before sharing.
- Bucketing is deterministic heuristic clustering, not semantic AI analysis.
- V1 supports Markdown and JSON output formats.
