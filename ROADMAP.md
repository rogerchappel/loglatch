# Roadmap

This roadmap describes intended direction, not a binding delivery promise.
Review it regularly and update it as the project learns from users,
contributors, and implementation constraints.

## Now

- Stabilize the `scan` command around local files, redaction, clustering, Markdown, and JSON.
- Keep repository setup, documentation, and verification easy for contributors
  to follow.
- Dogfood against agent build logs using synthetic fixtures only.

## Next

- Add SARIF or GitHub Step Summary renderers if CI users ask for them.
- Add configurable redaction patterns while keeping safe defaults.
- Improve tests, docs, and examples around the most used workflows.

## Later

- Add optional framework-aware recognizers for common test runners.
- Consider richer bucket fingerprints after the heuristic core is stable.
- Revisit packaging, deployment, or integration options based on real demand.

## Not Planned

- Unrelated platform rewrites without a clear migration path.
- Mandatory dependencies on a single ecosystem unless the project requires it.
- Public release dates before maintainers are ready to commit to them.

## Roadmap Review

Before each major or meaningful minor release:

- Move completed user-visible work into `CHANGELOG.md`.
- Remove stale commitments.
- Promote only the next reviewable set of work into `Now`.
