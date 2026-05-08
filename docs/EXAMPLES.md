# Example commands

From the repository root after `npm run build`:

```bash
node dist/src/cli.js scan examples/failing-test.log --out /tmp/loglatch-triage.md --fail-on none
```

Use JSON for scripts:

```bash
node dist/src/cli.js scan examples/*.log examples/*.jsonl --json --fail-on none \
  | node -e 'let data=""; process.stdin.on("data", c => data += c); process.stdin.on("end", () => console.log(JSON.parse(data).summary.buckets));'
```

Use thresholds for CI:

```bash
node dist/src/cli.js scan examples/failing-test.log --fail-on fatal
```

That fixture contains a fatal line, so the command exits with code `1` after rendering the report.
