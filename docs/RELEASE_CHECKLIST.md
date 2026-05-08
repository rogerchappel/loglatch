# Release checklist

Before cutting a LogLatch release:

- [ ] `npm ci`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run smoke`
- [ ] `bash scripts/validate.sh`
- [ ] real CLI smoke with checked-in fixture:

  ```bash
  node dist/src/cli.js scan examples/failing-test.log --out /tmp/loglatch-triage.md --fail-on none
  ```

- [ ] review README examples against current CLI help
- [ ] review `docs/REDACTION.md` for any changed patterns
- [ ] confirm npm publishing is intentionally enabled or disabled for the release
