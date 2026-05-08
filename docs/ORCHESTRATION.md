# LogLatch orchestration

LogLatch is intentionally boring to orchestrate: install dependencies, run local checks, and call the CLI against local fixtures or logs. No hosted service, telemetry endpoint, or token is required.

## Default local loop

```bash
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## Agent workflow

1. Read `docs/PRD.md` and `docs/TASKS.md`.
2. Make small commits that keep `npm run smoke` green.
3. Use fixtures under `examples/` for deterministic triage behavior.
4. Never upload user logs; copy only minimal synthetic snippets into tests.
5. If real logs are used locally, keep them outside the repo or add them to `.gitignore`.

## CI workflow

The generated GitHub Actions workflow runs the package checks on pull requests and `main`. The MVP release gate is:

```bash
npm run release:check
```

## CLI smoke workflow

```bash
npm run build
node dist/cli.js scan examples/failing-test.log --out /tmp/loglatch-triage.md --fail-on none
node dist/cli.js scan examples/*.log examples/*.jsonl --json --fail-on fatal
```

The second command should exit non-zero because the fixture contains a fatal line. That is expected and useful for CI quality gates.

## Network policy

LogLatch itself performs no network calls. Repository creation, GitHub metadata, branch protection, and release publishing are external operator actions and are not part of the CLI runtime.
