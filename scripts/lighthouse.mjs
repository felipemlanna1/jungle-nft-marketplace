import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
const target = process.env.AUDIT_URL || 'http://127.0.0.1:4173';
await mkdir('reports/lighthouse', { recursive: true });
const combinations = ['/', '/nft/nft-1'].flatMap((path) =>
  ['mobile', 'desktop'].map((profile) => ({ path, profile })),
);
const rows = [];
for (const { path, profile } of combinations) {
  const results = [];
  for (let run = 1; run <= 3; run++) {
    const file = `reports/lighthouse/${path === '/' ? 'home' : 'detail'}-${profile}-${run}`;
    const args = [
      'node_modules/lighthouse/cli/index.js',
      target + path,
      '--output=json',
      '--output=html',
      `--output-path=${file}`,
      '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
      '--quiet',
      '--only-categories=performance,accessibility,best-practices,seo',
    ];
    if (profile === 'desktop') args.push('--preset=desktop');
    const exit = await new Promise((resolve) => {
      const p = spawn(process.execPath, args, {
        stdio: 'inherit',
        env: { ...process.env, CHROME_PATH: chromium.executablePath() },
      });
      p.on('exit', resolve);
    });
    if (exit !== 0) throw new Error(`Lighthouse failed: ${path} ${profile} ${run}`);
    const data = JSON.parse(
      await (await import('node:fs/promises')).readFile(file + '.report.json', 'utf8'),
    );
    results.push({
      categories: Object.fromEntries(
        Object.entries(data.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
      ),
      LCP: data.audits['largest-contentful-paint'].numericValue,
      CLS: data.audits['cumulative-layout-shift'].numericValue,
      TBT: data.audits['total-blocking-time'].numericValue,
    });
  }
  const median = (key) => results.map((r) => r.categories[key]).sort((a, b) => a - b)[1];
  rows.push({
    path,
    profile,
    medians: Object.fromEntries(
      ['performance', 'accessibility', 'best-practices', 'seo'].map((k) => [k, median(k)]),
    ),
    runs: results,
  });
}
await writeFile(
  'reports/lighthouse/summary.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      node: process.version,
      browser: 'Chromium provided by Playwright',
      target,
      rows,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    rows.map(({ path, profile, medians }) => ({ path, profile, medians })),
    null,
    2,
  ),
);
