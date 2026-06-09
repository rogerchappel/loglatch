# CI Triage Demo

This demo scans the checked-in failure log, writes Markdown and JSON reports,
and shows how `--fail-on` can be used as a local quality gate.

## Setup

```sh
npm install
npm run build
rm -rf /tmp/loglatch-demo
mkdir -p /tmp/loglatch-demo
```

## Run the demo

Write a Markdown report without failing the shell:

```sh
node dist/src/cli.js scan examples/failing-test.log --out /tmp/loglatch-demo/triage.md --fail-on none
```

Write JSON for automation:

```sh
node dist/src/cli.js scan examples/failing-test.log --json --fail-on none > /tmp/loglatch-demo/triage.json
```

Preview the report:

```sh
sed -n '1,80p' /tmp/loglatch-demo/triage.md
```

Try a stricter local gate:

```sh
node dist/src/cli.js scan examples/failing-test.log --fail-on error
```

The last command exits non-zero when the fixture contains error-level buckets.
Use `--fail-on none` in demos when you want to inspect output without stopping a
script.

## Expected proof points

- Common secret-like values are redacted by default.
- Repeated warnings, errors, and fatals are grouped into deterministic buckets.
- Markdown is useful for humans; JSON is useful for CI or other automation.

## Cleanup

```sh
rm -rf /tmp/loglatch-demo
```
