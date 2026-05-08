import { type FailThreshold, type Severity, severities } from './types.js';

const aliases: Record<string, Severity> = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  notice: 'info',
  warn: 'warn',
  warning: 'warn',
  err: 'error',
  error: 'error',
  failed: 'error',
  failure: 'error',
  fatal: 'fatal',
  panic: 'fatal',
  critical: 'fatal',
  crit: 'fatal'
};

export function normalizeSeverity(value: string | undefined): Severity {
  if (!value) return 'info';
  return aliases[value.toLowerCase()] ?? 'info';
}

export function inferSeverity(line: string): Severity {
  const lowered = line.toLowerCase();
  if (/\b(fatal|panic|critical|uncaught|segmentation fault)\b/.test(lowered)) return 'fatal';
  if (/\b(error|failed|failure|exception|stack trace|traceback)\b/.test(lowered)) return 'error';
  if (/\b(warn|warning|deprecated|flaky|retry)\b/.test(lowered)) return 'warn';
  if (/\b(debug)\b/.test(lowered)) return 'debug';
  if (/\b(trace)\b/.test(lowered)) return 'trace';
  return 'info';
}

export function compareSeverity(a: Severity, b: Severity): number {
  return severities.indexOf(a) - severities.indexOf(b);
}

export function maxSeverity(values: Severity[]): Severity {
  return values.reduce((max, value) => compareSeverity(value, max) > 0 ? value : max, 'trace' as Severity);
}

export function reachesThreshold(severity: Severity, threshold: FailThreshold): boolean {
  if (threshold === 'none') return false;
  return compareSeverity(severity, threshold) >= 0;
}

export function parseFailThreshold(value: string): FailThreshold {
  const lowered = value.toLowerCase();
  if (lowered === 'none' || severities.includes(lowered as Severity)) return lowered as FailThreshold;
  throw new Error(`Invalid --fail-on value "${value}". Expected one of: none, ${severities.join(', ')}.`);
}
