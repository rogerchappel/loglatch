import { writeFile } from 'node:fs/promises';
import { loadInputs } from './files.js';
import { parseLogContent, clusterLines, type ParsedLine } from './parser.js';
import { redactMaybe } from './redact.js';
import { renderJson, renderMarkdown } from './render.js';
import { compareSeverity, maxSeverity, reachesThreshold } from './severity.js';
import type { ScanOptions, ScanReport, Severity } from './types.js';

export async function scan(options: ScanOptions): Promise<ScanReport> {
  const loaded = await loadInputs(options.inputs, options.cwd);
  const parsed: ParsedLine[] = [];
  let totalLines = 0;

  for (const file of loaded) {
    const redacted = redactMaybe(file.content, options.redact);
    const lines = redacted.text.split(/\r?\n/);
    totalLines += lines.filter((line) => line.length > 0).length;
    parsed.push(...parseLogContent(file.displayPath, redacted.text));
  }

  const buckets = clusterLines(parsed, options.maxLinesPerBucket);
  const severities = parsed.map((line) => line.severity);
  const highestSeverity = severities.length > 0 ? maxSeverity(severities) : 'info';
  const fatalCount = parsed.filter((line) => line.severity === 'fatal').length;
  const errorCount = parsed.filter((line) => line.severity === 'error').length;
  const warnCount = parsed.filter((line) => line.severity === 'warn').length;
  const exitCode = buckets.some((bucket) => reachesThreshold(bucket.severity, options.failOn)) ? 1 : 0;

  return {
    tool: 'loglatch',
    version: '0.1.0',
    generatedAt: new Date(0).toISOString(),
    inputs: loaded.map((file) => file.displayPath),
    summary: {
      files: loaded.length,
      lines: totalLines,
      buckets: buckets.length,
      highestSeverity: highestInteresting(highestSeverity),
      fatalCount,
      errorCount,
      warnCount,
      redacted: options.redact
    },
    buckets,
    exitCode
  };
}

export async function scanAndRender(options: ScanOptions): Promise<{ report: ScanReport; output: string }> {
  const report = await scan(options);
  const output = options.format === 'json' ? renderJson(report) : renderMarkdown(report);
  if (options.out) await writeFile(options.out, output, 'utf8');
  return { report, output };
}

function highestInteresting(severity: Severity): Severity {
  return compareSeverity(severity, 'warn') < 0 ? 'info' : severity;
}
