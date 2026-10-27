import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLighthouseEngine } from './lib/lighthouse-engine.mjs';

test('the default audit retains the stable engine and canonical summary', () => {
  assert.deepEqual(resolveLighthouseEngine(), {
    name: 'stable',
    packageName: 'lighthouse',
    experimental: false,
    summary: 'summary.json',
  });
});

test('the HTTP/3 diagnostic stays experimental and cannot replace the stable summary', () => {
  assert.deepEqual(resolveLighthouseEngine('h3'), {
    name: 'h3',
    packageName: 'lighthouse-h3',
    experimental: true,
    summary: 'h3-summary.json',
  });
});

test('unknown engines fail instead of choosing a more favorable audit', () => {
  for (const value of ['', 'devtools', '../lighthouse', 'h3-next'])
    assert.throws(() => resolveLighthouseEngine(value), /AUDIT_ENGINE/);
});
