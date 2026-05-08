# Redaction notes

LogLatch redacts common secret shapes before parsing and rendering reports. This keeps the same redacted text in Markdown, JSON, fingerprints, and evidence snippets.

## Covered patterns

- GitHub tokens beginning with `ghp_`, `gho_`, `ghu_`, `ghs_`, or `ghr_`
- AWS access key IDs beginning with `AKIA` or `ASIA`
- Slack tokens beginning with `xox...`
- `Bearer ...` authorization values
- common assignments such as `api_key=...`, `token: ...`, `secret=...`, and `password=...`
- URL credentials like `https://user:password@example.test`
- PEM private key blocks

## Intentional limits

Redaction is a practical first pass, not a proof of sanitization. Logs with custom credential formats should be reviewed before sharing reports. Future versions may add user-defined patterns while keeping the zero-config defaults safe.
