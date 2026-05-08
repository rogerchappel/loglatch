# LogLatch examples

These fixtures are intentionally tiny and safe to commit. They demonstrate:

- plain-text test output with repeated failures and fake secrets
- JSONL agent/build output with structured severity fields

Run:

```bash
npm run build
node dist/src/cli.js scan examples/*.log examples/*.jsonl --json --fail-on none
```
