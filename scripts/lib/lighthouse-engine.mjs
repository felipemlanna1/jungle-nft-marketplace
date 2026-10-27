export function resolveLighthouseEngine(value = 'stable') {
  if (value === 'stable')
    return { name: value, packageName: 'lighthouse', experimental: false, summary: 'summary.json' };
  if (value === 'h3')
    return {
      name: value,
      packageName: 'lighthouse-h3',
      experimental: true,
      summary: 'h3-summary.json',
    };
  throw new Error('AUDIT_ENGINE must be stable or h3.');
}
