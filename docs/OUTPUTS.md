# Output contract

LogLatch emits either Markdown for humans or JSON for automation.

## Markdown

Markdown reports include:

1. generation metadata
2. scanned input list
3. summary counts
4. severity-sorted buckets
5. source file and line evidence

Markdown is designed for issue comments, PR summaries, and local triage notes.

## JSON

JSON reports use the exported `ScanReport` shape from `src/types.ts`:

- `tool`, `version`, and `generatedAt`
- `inputs`
- `summary`
- `buckets`
- `exitCode`

The MVP pins `generatedAt` to the Unix epoch to keep fixture output deterministic. A future release can add a `--real-time` flag if timestamp freshness becomes more useful than stable diffs.

## Exit codes

- `0`: scan completed and no bucket reached `--fail-on`
- `1`: scan completed and at least one bucket reached `--fail-on`
- `2`: CLI usage or runtime error
