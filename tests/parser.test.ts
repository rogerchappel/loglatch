import test from 'node:test';
import assert from 'node:assert/strict';
import { clusterLines, parseLogContent } from '../src/parser.js';

test('parses structured jsonl severity and clusters numeric variants', () => {
  const lines = parseLogContent('agent.jsonl', [
    '{"level":"error","message":"build failed with exit code 2"}',
    '{"level":"error","message":"build failed with exit code 1"}',
    '{"level":"info","message":"all done"}'
  ].join('\n'));
  const buckets = clusterLines(lines, 5);
  assert.equal(buckets.length, 1);
  assert.equal(buckets[0]?.count, 2);
  assert.equal(buckets[0]?.severity, 'error');
});

test('infers fatal text from plain logs', () => {
  const lines = parseLogContent('plain.log', 'fatal Uncaught exception at line 42');
  assert.equal(lines[0]?.severity, 'fatal');
});
