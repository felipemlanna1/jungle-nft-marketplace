import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyHostedBuild } from './lib/hosted-artifacts.mjs';

const configuration = await readFile(new URL('../public/_headers', import.meta.url));
const document = Buffer.from('<html><head></head><body>Application</body></html>');
const javascriptPath = '/assets/index-12345678.js';
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const describe = (path, body) => ({ path, bytes: body.length, sha256: sha256(body) });

function fixture({ raw = false, fallback = false, headers = configuration } = {}) {
  const files = new Map([
    ['/_headers', headers],
    ['/index.html', document],
    [javascriptPath, Buffer.from('console.log("application");')],
    ['/mockServiceWorker.js', Buffer.from('// the unchanged service worker')],
    ['/arbitrary.txt', Buffer.from('A normal artifact must always match.')],
  ]);
  const responses = new Map(
    [...files].map(([path, body]) => [path, { body, status: 200, cacheControl: null }]),
  );
  responses.set('/', { body: document, status: 200, cacheControl: 'no-cache, no-transform' });
  responses.set('/nft/nft-1', {
    body: document,
    status: 200,
    cacheControl: 'no-cache, no-transform',
  });
  responses.get(javascriptPath).cacheControl = 'public, max-age=31536000, immutable';
  responses.get('/mockServiceWorker.js').cacheControl = 'no-cache';
  if (!raw)
    responses.set('/_headers', {
      body: fallback ? document : 'Not found',
      status: fallback ? 200 : 404,
      cacheControl: null,
    });
  const requests = [];
  const options = {
    target: 'https://example.test',
    buildFiles: [...files].map(([path, body]) => describe(path.slice(1), body)),
    runtimeSources: [describe('public/_headers', headers)],
    expectedDocument: document,
    fetchImpl: async (url) => {
      const path = new URL(url).pathname;
      requests.push(path);
      const { body, status, cacheControl } = responses.get(path);
      return new Response(body, {
        status,
        headers: cacheControl ? { 'cache-control': cacheControl } : {},
      });
    },
  };
  return { options, responses, requests, files };
}

for (const fallback of [false, true])
  test(`accepts the reviewed consumed configuration with verified policies (${fallback ? 'SPA' : '404'})`, async () => {
    const { options, requests } = fixture({ fallback });
    const result = await verifyHostedBuild(options);
    const [config] = result.hostingConfigurationVerification;
    assert.equal(config.mode, 'consumed-static-asset-configuration');
    assert.equal(config.support, 'verified');
    assert.equal(config.policiesApplied, true);
    assert.equal(config.sourceSha256, sha256(configuration));
    assert.equal(config.sourceSha256, config.buildSha256);
    assert.equal(config.buildSha256, config.knownConfigurationSha256);
    assert.equal(config.runtimePolicyChecks.length, 4);
    assert.equal(result.hostedDocumentVerification.mode, 'exact');
    for (const file of options.buildFiles) assert.equal(requests.includes(`/${file.path}`), true);
    assert.equal(requests.includes('/'), true);
    assert.equal(requests.includes('/nft/nft-1'), true);
  });

for (const path of ['/', '/nft/nft-1', javascriptPath, '/mockServiceWorker.js']) {
  test(`rejects a consumed configuration when the runtime header differs at ${path}`, async () => {
    const { options, responses } = fixture();
    responses.get(path).cacheControl = 'public, max-age=0, must-revalidate';
    await assert.rejects(verifyHostedBuild(options), /policy is not applied/);
  });
  test(`requires HTTP 200 for runtime policy evidence at ${path}`, async () => {
    const { options, responses } = fixture();
    responses.get(path).status = 404;
    await assert.rejects(verifyHostedBuild(options), /policy is not applied/);
  });
}

test('accepts unchanged raw configuration bytes without claiming header support', async () => {
  const { options } = fixture({ raw: true });
  const { hostingConfigurationVerification } = await verifyHostedBuild(options);
  const [config] = hostingConfigurationVerification;
  assert.equal(config.mode, 'served-as-raw-file');
  assert.equal(config.support, 'unsupported');
  assert.equal(config.policiesApplied, false);
  assert.deepEqual(config.runtimePolicyChecks, []);
  assert.equal(config.responseSha256, config.buildSha256);
});

test('requires source/build identity before accepting consumed configuration', async () => {
  const { options } = fixture();
  options.runtimeSources[0].sha256 = '0'.repeat(64);
  await assert.rejects(verifyHostedBuild(options), /source and production build must be identical/);
});

test('does not extend the consumed configuration exception to a changed _headers file', async () => {
  const { options } = fixture({ headers: Buffer.from('/\n  Cache-Control: no-store\n') });
  await assert.rejects(verifyHostedBuild(options), /Only the reviewed/);
});

test('rejects changed raw bytes rather than interpreting arbitrary text as configuration', async () => {
  const { options, responses } = fixture({ raw: true });
  responses.get('/_headers').body = 'Changed configuration';
  await assert.rejects(verifyHostedBuild(options), /Hosted HTML differs/);
});

test('rejects an unexpected error response for consumed configuration', async () => {
  const { options, responses } = fixture();
  responses.get('/_headers').status = 500;
  await assert.rejects(verifyHostedBuild(options), /must return 404 or the verified SPA/);
});

for (const path of ['/', '/nft/nft-1', javascriptPath, '/mockServiceWorker.js', '/arbitrary.txt'])
  test(`never ignores changed application bytes at ${path}`, async () => {
    const { options, responses } = fixture();
    responses.get(path).body = 'Changed application content';
    await assert.rejects(verifyHostedBuild(options), /HTML differs|artifact differs/);
  });

test('does not exempt another configuration-like artifact from byte comparison', async () => {
  const { options, responses } = fixture();
  const body = Buffer.from('This is still an ordinary artifact.');
  options.buildFiles.push(describe('_redirects', body));
  responses.set('/_redirects', { body: 'Not found', status: 404, cacheControl: null });
  await assert.rejects(verifyHostedBuild(options), /artifact differs.*_redirects/);
});

test('allows equivalent directive order and case, but rejects extra policy directives', async () => {
  const { options, responses } = fixture();
  responses.get(javascriptPath).cacheControl = 'IMMUTABLE, PUBLIC, MAX-AGE=31536000';
  await verifyHostedBuild(options);
  responses.get(javascriptPath).cacheControl += ', no-store';
  await assert.rejects(verifyHostedBuild(options), /policy is not applied/);
});
