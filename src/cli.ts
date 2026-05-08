#!/usr/bin/env node
import path from 'node:path';
import { parseFailThreshold } from './severity.js';
import { scanAndRender } from './scan.js';
import type { OutputFormat, ScanOptions } from './types.js';

const help = `LogLatch — local-first log triage without surprise uploads.

Usage:
  loglatch scan <files...> [--out <path>] [--json] [--markdown] [--fail-on <level>] [--no-redact]
  loglatch examples
  loglatch --help

Options:
  --out <path>       Write report to a file instead of stdout.
  --json             Render JSON output.
  --markdown         Render Markdown output (default).
  --fail-on <level>  Exit 1 when a bucket reaches: none, warn, error, fatal. Default: fatal.
  --redact           Redact common secrets (default).
  --no-redact        Keep input text unchanged. Use carefully.
  --max-evidence <n> Evidence lines per bucket. Default: 5.
`;

export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    const command = argv[0];
    if (!command || command === '--help' || command === '-h') {
      process.stdout.write(help);
      return 0;
    }
    if (command === '--version' || command === '-v') {
      process.stdout.write('0.1.0\n');
      return 0;
    }
    if (command === 'examples') {
      process.stdout.write(exampleText());
      return 0;
    }
    if (command !== 'scan') throw new Error(`Unknown command "${command}". Try loglatch --help.`);

    const options = parseScanArgs(argv.slice(1));
    const { report, output } = await scanAndRender(options);
    if (!options.out) process.stdout.write(output);
    return report.exitCode;
  } catch (error) {
    process.stderr.write(`loglatch: ${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
}

function parseScanArgs(args: string[]): ScanOptions {
  const inputs: string[] = [];
  let format: OutputFormat = 'markdown';
  let out: string | undefined;
  let failOn = parseFailThreshold('fatal');
  let redact = true;
  let maxLinesPerBucket = 5;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg) continue;
    if (arg === '--json') format = 'json';
    else if (arg === '--markdown') format = 'markdown';
    else if (arg === '--redact') redact = true;
    else if (arg === '--no-redact') redact = false;
    else if (arg === '--out') out = requireValue(args, ++index, '--out');
    else if (arg === '--fail-on') failOn = parseFailThreshold(requireValue(args, ++index, '--fail-on'));
    else if (arg === '--max-evidence') maxLinesPerBucket = parsePositiveInt(requireValue(args, ++index, '--max-evidence'));
    else if (arg.startsWith('-')) throw new Error(`Unknown scan option "${arg}".`);
    else inputs.push(arg);
  }

  if (inputs.length === 0) throw new Error('scan requires at least one input file or glob.');
  return {
    inputs,
    cwd: process.cwd(),
    redact,
    format,
    ...(out ? { out: path.resolve(process.cwd(), out) } : {}),
    failOn,
    maxLinesPerBucket
  };
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value.`);
  return value;
}

function parsePositiveInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) throw new Error('--max-evidence must be a positive integer.');
  return parsed;
}

function exampleText(): string {
  return `Try these from the repository root:\n\n  loglatch scan examples/failing-test.log --out triage.md\n  loglatch scan examples/*.log --json --fail-on fatal\n  loglatch scan examples/failing-test.log --no-redact\n\nLogLatch is offline by design. It reads the files you name and writes only stdout or --out.\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => { process.exitCode = code; });
}
