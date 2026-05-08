import type { FailureBucket, ScanReport, Severity } from './types.js';

export function renderJson(report: ScanReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderMarkdown(report: ScanReport): string {
  const lines: string[] = [];
  lines.push('# LogLatch triage report');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Inputs: ${report.inputs.map((input) => `\`${escapeMarkdown(input)}\``).join(', ')}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Files scanned: ${report.summary.files}`);
  lines.push(`- Lines scanned: ${report.summary.lines}`);
  lines.push(`- Failure buckets: ${report.summary.buckets}`);
  lines.push(`- Highest severity: **${report.summary.highestSeverity}**`);
  lines.push(`- Fatal lines: ${report.summary.fatalCount}`);
  lines.push(`- Error lines: ${report.summary.errorCount}`);
  lines.push(`- Warning lines: ${report.summary.warnCount}`);
  lines.push(`- Redaction: ${report.summary.redacted ? 'enabled' : 'disabled'}`);
  lines.push(`- Suggested exit code: ${report.exitCode}`);
  lines.push('');

  if (report.buckets.length === 0) {
    lines.push('## Buckets');
    lines.push('');
    lines.push('No warning, error, or fatal lines were detected. Nice and quiet.');
    lines.push('');
    return lines.join('\n');
  }

  lines.push('## Buckets');
  lines.push('');
  report.buckets.forEach((bucket, index) => {
    appendBucket(lines, bucket, index + 1);
  });
  return `${lines.join('\n')}\n`;
}

function appendBucket(lines: string[], bucket: FailureBucket, index: number): void {
  lines.push(`### ${index}. ${emojiFor(bucket.severity)} ${escapeMarkdown(bucket.title)}`);
  lines.push('');
  lines.push(`- Bucket: \`${bucket.id}\``);
  lines.push(`- Severity: **${bucket.severity}**`);
  lines.push(`- Count: ${bucket.count}`);
  lines.push(`- Files: ${bucket.files.map((file) => `\`${escapeMarkdown(file)}\``).join(', ')}`);
  lines.push(`- First seen: ${escapeMarkdown(bucket.firstSeen)}`);
  lines.push(`- Last seen: ${escapeMarkdown(bucket.lastSeen)}`);
  lines.push(`- Fingerprint: \`${escapeMarkdown(bucket.fingerprint)}\``);
  lines.push('');
  lines.push('Evidence:');
  lines.push('');
  for (const line of bucket.evidence) {
    lines.push(`- \`${escapeMarkdown(line.file)}:${line.line}\` [${line.severity}] ${escapeMarkdown(line.message)}`);
  }
  lines.push('');
}

function emojiFor(severity: Severity): string {
  return ({ fatal: '🧯', error: '🔥', warn: '⚠️', info: 'ℹ️', debug: '🔎', trace: '·' })[severity];
}

function escapeMarkdown(value: string): string {
  return value.replace(/`/g, '\\`');
}
