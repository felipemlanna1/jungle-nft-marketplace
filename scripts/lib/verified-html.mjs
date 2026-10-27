import { createHash } from 'node:crypto';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
// Fingerprint of the observed Cloudflare JSD script, with only its ray ID and
// base64 Unix timestamp replaced. A platform template change requires review.
const cloudflareTemplateSha256 = '5ac2e2ca5c2dd88d033a5cf3edd3a5e8aa8ada2478e06df151043af69d2a560c';
const volatileParameters =
  /window\.__CF\$cv\$params=\{r:'([0-9a-f]{16})',t:'([A-Za-z0-9+/]{14}==)'\};/;
const parametersTemplate = "window.__CF$cv$params={r:'<ray-id>',t:'<unix-time-base64>'};";

export function verifyHostedHtml(received, expected) {
  const raw = Buffer.from(received);
  const artifact = Buffer.from(expected);
  const rawSha256 = sha256(raw);
  const expectedSha256 = sha256(artifact);
  if (raw.equals(artifact))
    return { mode: 'exact', rawSha256, normalizedSha256: rawSha256, injectionCount: 0 };

  const html = raw.toString('utf8');
  const candidates = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].filter(
    ([script]) =>
      script.includes('window.__CF$cv$params') || script.includes('/cdn-cgi/challenge-platform/'),
  );
  if (candidates.length !== 1)
    throw new Error(
      'Hosted HTML differs; exactly one recognized Cloudflare JSD envelope is required.',
    );
  const [script] = candidates[0];
  const parameters = script.match(volatileParameters);
  if (
    !parameters ||
    !/^\d{10}$/.test(Buffer.from(parameters[2], 'base64').toString('utf8')) ||
    !html.includes(script + '</body>')
  )
    throw new Error('Hosted HTML contains an unrecognized Cloudflare JSD envelope.');

  const templateSha256 = sha256(script.replace(volatileParameters, parametersTemplate));
  if (templateSha256 !== cloudflareTemplateSha256)
    throw new Error(
      'Cloudflare JSD script template changed; review the new payload before auditing.',
    );
  const normalized = Buffer.from(html.replace(script, ''));
  if (!normalized.equals(artifact))
    throw new Error('Application HTML differs after recognizing the known Cloudflare envelope.');
  return {
    mode: 'known-cloudflare-jsd-envelope',
    rawSha256,
    normalizedSha256: sha256(normalized),
    expectedSha256,
    injectionCount: 1,
    scriptSha256: sha256(script),
    templateSha256,
    scriptPath: '/cdn-cgi/challenge-platform/scripts/jsd/main.js',
    volatileFields: ['rayId', 'base64UnixTimestamp'],
    documentation:
      'https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/',
    measurement:
      'The browser receives the original response and executes the platform script unchanged.',
  };
}
