import { createHash } from 'node:crypto';
import { inferSeverity, maxSeverity, normalizeSeverity } from './severity.js';
import type { EvidenceLine, FailureBucket, Severity } from './types.js';

export type ParsedLine = EvidenceLine & {
  fingerprint: string;
};

export function parseLogContent(file: string, content: string): ParsedLine[] {
  return content.split(/\r?\n/).flatMap((raw, index) => {
    if (raw.trim().length === 0) return [];
    const parsed = parseStructured(raw);
    const message = parsed.message || raw.trim();
    const severity = parsed.severity ?? inferSeverity(raw);
    const timestamp = parsed.timestamp ?? extractTimestamp(raw);
    return [{
      file,
      line: index + 1,
      severity,
      message,
      raw,
      ...(timestamp ? { timestamp } : {}),
      fingerprint: fingerprintLine(message)
    }];
  });
}

export function interestingLines(lines: ParsedLine[]): ParsedLine[] {
  return lines.filter((line) => line.severity === 'warn' || line.severity === 'error' || line.severity === 'fatal');
}

export function clusterLines(lines: ParsedLine[], maxLinesPerBucket: number): FailureBucket[] {
  const buckets = new Map<string, ParsedLine[]>();
  for (const line of interestingLines(lines)) {
    const current = buckets.get(line.fingerprint) ?? [];
    current.push(line);
    buckets.set(line.fingerprint, current);
  }

  return [...buckets.entries()]
    .map(([fingerprint, bucketLines]) => toBucket(fingerprint, bucketLines, maxLinesPerBucket))
    .sort((a, b) => {
      const severityDelta = severityRank(b.severity) - severityRank(a.severity);
      if (severityDelta !== 0) return severityDelta;
      return b.count - a.count || a.title.localeCompare(b.title);
    });
}

function parseStructured(raw: string): { severity?: Severity; message?: string; timestamp?: string } {
  const trimmed = raw.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      const value = JSON.parse(trimmed) as Record<string, unknown>;
      const severity = stringValue(value.level) ?? stringValue(value.severity) ?? stringValue(value.status);
      const message = stringValue(value.message) ?? stringValue(value.msg) ?? stringValue(value.error) ?? trimmed;
      const timestamp = stringValue(value.time) ?? stringValue(value.timestamp) ?? stringValue(value.ts);
      return {
        ...(severity ? { severity: normalizeSeverity(severity) } : {}),
        message,
        ...(timestamp ? { timestamp } : {})
      };
    } catch {
      return parseTextLine(raw);
    }
  }
  return parseTextLine(raw);
}

function parseTextLine(raw: string): { severity?: Severity; message?: string; timestamp?: string } {
  const timestamp = extractTimestamp(raw);
  const levelMatch = raw.match(/(?:^|\s|\[|\{|\()(trace|debug|info|notice|warn|warning|err|error|failed|failure|fatal|panic|critical|crit)(?:\]|\}|\)|:|\s|-)/i);
  const cleaned = raw
    .replace(/^\s*\[[^\]]+\]\s*/, '')
    .replace(/^\s*\d{4}-\d{2}-\d{2}T\S+\s*/, '')
    .trim();
  return {
    ...(levelMatch?.[1] ? { severity: normalizeSeverity(levelMatch[1]) } : {}),
    message: cleaned,
    ...(timestamp ? { timestamp } : {})
  };
}

function toBucket(fingerprint: string, lines: ParsedLine[], maxLinesPerBucket: number): FailureBucket {
  const severity = maxSeverity(lines.map((line) => line.severity));
  const first = lines[0];
  const last = lines[lines.length - 1];
  if (!first || !last) throw new Error('Cannot create a bucket from no lines.');
  const files = [...new Set(lines.map((line) => line.file))].sort();
  return {
    id: shortHash(fingerprint),
    fingerprint,
    title: titleFor(first.message),
    severity,
    count: lines.length,
    firstSeen: first.timestamp ?? `${first.file}:${first.line}`,
    lastSeen: last.timestamp ?? `${last.file}:${last.line}`,
    files,
    evidence: lines.slice(0, maxLinesPerBucket).map(({ fingerprint: _fingerprint, ...line }) => line)
  };
}

function fingerprintLine(message: string): string {
  const normalized = message
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/\b[0-9a-f]{7,40}\b/g, '<hash>')
    .replace(/\b\d+\b/g, '<num>')
    .replace(/['"][^'"]{20,}['"]/g, '<string>')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.slice(0, 180) || 'unclassified failure';
}

function titleFor(message: string): string {
  return message.replace(/\s+/g, ' ').trim().slice(0, 96) || 'Unclassified failure';
}

function shortHash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 10);
}

function severityRank(severity: Severity): number {
  return ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].indexOf(severity);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function extractTimestamp(raw: string): string | undefined {
  return raw.match(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?\b/)?.[0];
}
