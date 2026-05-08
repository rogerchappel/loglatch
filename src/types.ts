export type Severity = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type OutputFormat = 'markdown' | 'json';

export type FailThreshold = 'none' | Severity;

export type ScanOptions = {
  inputs: string[];
  cwd: string;
  redact: boolean;
  format: OutputFormat;
  out?: string;
  failOn: FailThreshold;
  maxLinesPerBucket: number;
};

export type EvidenceLine = {
  file: string;
  line: number;
  severity: Severity;
  message: string;
  raw: string;
  timestamp?: string;
};

export type FailureBucket = {
  id: string;
  fingerprint: string;
  title: string;
  severity: Severity;
  count: number;
  firstSeen: string;
  lastSeen: string;
  files: string[];
  evidence: EvidenceLine[];
};

export type ScanSummary = {
  files: number;
  lines: number;
  buckets: number;
  highestSeverity: Severity;
  fatalCount: number;
  errorCount: number;
  warnCount: number;
  redacted: boolean;
};

export type ScanReport = {
  tool: 'loglatch';
  version: string;
  generatedAt: string;
  inputs: string[];
  summary: ScanSummary;
  buckets: FailureBucket[];
  exitCode: number;
};

export const severities: Severity[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
