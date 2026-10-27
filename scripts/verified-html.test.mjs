import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyHostedHtml } from './lib/verified-html.mjs';

const observed = await readFile(
  new URL(
    '../reports/lighthouse/runs/2026-10-27T18-14-14-524Z/public-index-captured.html',
    import.meta.url,
  ),
  'utf8',
);
const envelope = [...observed.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].find(([script]) =>
  script.includes('window.__CF$cv$params'),
)[0];
const application = observed.replace(envelope, '');

test('accepts byte-identical application HTML without a platform envelope', () => {
  assert.equal(verifyHostedHtml(application, application).mode, 'exact');
});
test('recognizes the observed platform template and records its separate hashes', () => {
  const result = verifyHostedHtml(observed, application);
  assert.equal(result.injectionCount, 1);
  assert.notEqual(result.rawSha256, result.normalizedSha256);
  assert.equal(result.normalizedSha256, result.expectedSha256);
  assert.equal(result.templateSha256.length, 64);
  assert.equal(result.scriptSha256.length, 64);
});
test('allows only the expected volatile ray ID and Unix timestamp fields', () => {
  const otherRequest = observed
    .replace(/r:'[0-9a-f]{16}'/, "r:'0000000000000001'")
    .replace(/t:'[A-Za-z0-9+/]{14}=='/, `t:'${Buffer.from('1793126000').toString('base64')}'`);
  assert.equal(
    verifyHostedHtml(otherRequest, application).normalizedSha256,
    verifyHostedHtml(observed, application).normalizedSha256,
  );
});
test('rejects application changes even alongside a known envelope', () => {
  assert.throws(() => verifyHostedHtml(observed.replace('Explore', 'Changed'), application));
});
test('rejects extra or unknown scripts without treating them as platform metadata', () => {
  assert.throws(() =>
    verifyHostedHtml(observed.replace('</body>', '<script>alert(1)</script></body>'), application),
  );
  assert.throws(() =>
    verifyHostedHtml(
      application.replace('</body>', '<script>alert(1)</script></body>'),
      application,
    ),
  );
});
test('rejects any change to the recognized script logic or path', () => {
  assert.throws(() => verifyHostedHtml(observed.replace('a.height=1', 'a.height=2'), application));
  assert.throws(() =>
    verifyHostedHtml(observed.replace('/jsd/main.js', '/jsd/other.js'), application),
  );
});
test('rejects duplicated envelopes, misplaced envelopes and malformed volatile fields', () => {
  assert.throws(() =>
    verifyHostedHtml(observed.replace(envelope, envelope + envelope), application),
  );
  assert.throws(() =>
    verifyHostedHtml(
      observed.replace(envelope, '').replace('</head>', envelope + '</head>'),
      application,
    ),
  );
  assert.throws(() =>
    verifyHostedHtml(
      observed.replace(/t:'[A-Za-z0-9+/]{14}=='/, "t:'YWJjZGVmZ2hpag=='"),
      application,
    ),
  );
});
