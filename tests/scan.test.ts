import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scanAndRender } from '../src/scan.js';

test('scan builds redacted json report and fails on fatal threshold', async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), 'loglatch-'));
  await writeFile(path.join(cwd, 'app.log'), 'warn slow thing\nfatal crashed token=abcdefghi123456\n');
  const { report, output } = await scanAndRender({
    inputs: ['app.log'],
    cwd,
    redact: true,
    format: 'json',
    failOn: 'fatal',
    maxLinesPerBucket: 5
  });
  assert.equal(report.exitCode, 1);
  assert.equal(report.summary.buckets, 2);
  assert.doesNotMatch(output, /abcdefghi/);
  assert.match(output, /REDACTED:token/);
});

test('scan can render markdown without failing when threshold is none', async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), 'loglatch-'));
  await writeFile(path.join(cwd, 'app.log'), 'error one\nerror one again\n');
  const { report, output } = await scanAndRender({
    inputs: ['*.log'],
    cwd,
    redact: true,
    format: 'markdown',
    failOn: 'none',
    maxLinesPerBucket: 1
  });
  assert.equal(report.exitCode, 0);
  assert.match(output, /LogLatch triage report/);
  assert.match(output, /Evidence:/);
});
