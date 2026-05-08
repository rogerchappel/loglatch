import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText } from '../src/redact.js';

test('redacts common assignment secrets', () => {
  const result = redactText('error api_key=sk_live_abc123456789 token: ghp_1234567890abcdefghijklmnop');
  assert.ok(result.count >= 2);
  assert.match(result.text, /api_key=\[REDACTED:api_key\]/);
  assert.match(result.text, /\[REDACTED:github-token\]/);
  assert.doesNotMatch(result.text, /sk_live_abc/);
});

test('redacts bearer tokens and url credentials', () => {
  const result = redactText('Authorization: Bearer abcdefghijklmnop and https://bot:swordfish@example.test');
  assert.match(result.text, /Bearer \[REDACTED:bearer-token\]/);
  assert.match(result.text, /bot:\[REDACTED:url-password\]@/);
});
