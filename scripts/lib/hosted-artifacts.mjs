import { createHash } from 'node:crypto';
import { verifyHostedHtml } from './verified-html.mjs';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
// Only this reviewed configuration can be represented by runtime policy evidence.
const knownHeadersSha256 = '3a1a46255d7e26661f8a523c5a19d403e91f7246c878fe086cc4dda7994ebbae';
const documentation = 'https://developers.cloudflare.com/workers/static-assets/headers/';
const directives = (value) =>
  value
    ?.split(',')
    .map((directive) => directive.trim().toLowerCase())
    .sort()
    .join(',');

export async function verifyHostedBuild({
  target,
  buildFiles,
  runtimeSources,
  expectedDocument,
  fetchImpl = fetch,
}) {
  const responses = new Map();
  async function receive(path) {
    if (!responses.has(path))
      responses.set(
        path,
        (async () => {
          const response = await fetchImpl(`${target}${path}`);
          const body = Buffer.from(await response.arrayBuffer());
          return {
            status: response.status,
            ok: response.ok,
            cacheControl: response.headers.get('cache-control'),
            body,
            sha256: sha256(body),
          };
        })(),
      );
    return responses.get(path);
  }

  function assertArtifact(file, response) {
    if (!response.ok || response.sha256 !== file.sha256)
      throw new Error(`Served artifact differs from the production build: ${file.path}`);
  }

  async function verifyConsumedHeaders(received, identity) {
    if (
      identity.sourceSha256 !== knownHeadersSha256 ||
      identity.buildSha256 !== knownHeadersSha256 ||
      identity.sourceBytes !== identity.buildBytes
    )
      throw new Error('Only the reviewed, identical source/build _headers may be consumed.');

    let fallbackDocumentVerification;
    if (received.status === 200)
      fallbackDocumentVerification = verifyHostedHtml(received.body, expectedDocument);
    else if (received.status !== 404)
      throw new Error('Consumed _headers must return 404 or the verified SPA document.');

    const javascript = buildFiles.find((artifact) =>
      /^assets\/[\w.-]+-[\w-]{8,}\.js$/.test(artifact.path),
    );
    const serviceWorker = buildFiles.find((artifact) => artifact.path === 'mockServiceWorker.js');
    if (!javascript || !serviceWorker)
      throw new Error('Header policy verification requires a hashed JavaScript asset and worker.');
    const policies = [
      { path: '/', expectedCacheControl: 'no-cache, no-transform', document: true },
      { path: '/nft/nft-1', expectedCacheControl: 'no-cache, no-transform', document: true },
      {
        path: `/${javascript.path}`,
        expectedCacheControl: 'public, max-age=31536000, immutable',
        artifact: javascript,
      },
      {
        path: '/mockServiceWorker.js',
        expectedCacheControl: 'no-cache',
        artifact: serviceWorker,
      },
    ];
    const runtimePolicyChecks = [];
    for (const policy of policies) {
      const response = await receive(policy.path);
      if (
        response.status !== 200 ||
        directives(response.cacheControl) !== directives(policy.expectedCacheControl)
      )
        throw new Error(`Consumed _headers policy is not applied: ${policy.path}`);
      const documentVerification = policy.document
        ? verifyHostedHtml(response.body, expectedDocument)
        : undefined;
      if (policy.artifact) assertArtifact(policy.artifact, response);
      runtimePolicyChecks.push({
        path: policy.path,
        status: response.status,
        cacheControl: response.cacheControl,
        expectedCacheControl: policy.expectedCacheControl,
        sha256: response.sha256,
        documentVerification,
      });
    }
    return {
      ...identity,
      mode: 'consumed-static-asset-configuration',
      support: 'verified',
      policiesApplied: true,
      knownConfigurationSha256: knownHeadersSha256,
      configurationResponse: received.status === 404 ? 'not-found' : 'verified-spa-fallback',
      fallbackDocumentVerification,
      runtimePolicyChecks,
      documentation,
    };
  }

  let hostedDocumentVerification;
  const hostingConfigurationVerification = [];
  // Every build file is checked. Only the exact reviewed _headers configuration
  // may use runtime policies instead of HTTP bytes; no asset has that exception.
  for (const file of buildFiles) {
    const received = await receive(`/${file.path}`);
    if (file.path === '_headers') {
      const source = runtimeSources.find((source) => source.path === 'public/_headers');
      if (source?.sha256 !== file.sha256 || source.bytes !== file.bytes)
        throw new Error('The _headers source and production build must be identical.');
      const identity = {
        path: file.path,
        sourcePath: source.path,
        sourceSha256: source.sha256,
        buildSha256: file.sha256,
        sourceBytes: source.bytes,
        buildBytes: file.bytes,
        responseStatus: received.status,
        responseSha256: received.sha256,
        responseBytes: received.body.length,
      };
      if (received.ok && received.sha256 === file.sha256)
        hostingConfigurationVerification.push({
          ...identity,
          mode: 'served-as-raw-file',
          support: 'unsupported',
          policiesApplied: false,
          runtimePolicyChecks: [],
          documentation,
        });
      else hostingConfigurationVerification.push(await verifyConsumedHeaders(received, identity));
    } else if (file.path === 'index.html') {
      if (!received.ok)
        throw new Error(`Served artifact differs from the production build: ${file.path}`);
      hostedDocumentVerification = verifyHostedHtml(received.body, expectedDocument);
    } else assertArtifact(file, received);
  }
  return { hostedDocumentVerification, hostingConfigurationVerification };
}
