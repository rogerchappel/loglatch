#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

node dist/cli.js --help >/dev/null
node dist/cli.js examples >/dev/null
node dist/cli.js scan examples/failing-test.log --out "$tmp_dir/triage.md" --fail-on none
node dist/cli.js scan examples/*.log examples/*.jsonl --json --fail-on none >"$tmp_dir/triage.json"

if grep -q 'sk_live_abc' "$tmp_dir/triage.md" "$tmp_dir/triage.json"; then
  echo "secret was not redacted" >&2
  exit 1
fi

grep -q 'LogLatch triage report' "$tmp_dir/triage.md"
grep -q '"tool": "loglatch"' "$tmp_dir/triage.json"

if node dist/cli.js scan examples/failing-test.log --fail-on fatal >/dev/null; then
  echo "fatal threshold smoke unexpectedly passed" >&2
  exit 1
fi

printf 'Smoke passed: markdown/json rendering, redaction, and fatal threshold.\n'
