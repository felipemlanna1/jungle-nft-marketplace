import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { verifyHostedHtml } from './lib/verified-html.mjs';
import { verifyHostedBuild } from './lib/hosted-artifacts.mjs';
import { resolveLighthouseEngine } from './lib/lighthouse-engine.mjs';

const target = process.env.AUDIT_URL || 'http://127.0.0.1:4173';
const engine = resolveLighthouseEngine(process.env.AUDIT_ENGINE);
const startedAt = new Date().toISOString();
const outputDirectory =
  process.env.AUDIT_OUTPUT_DIR ||
  `reports/lighthouse/${engine.experimental ? 'h3-runs' : 'runs'}/${startedAt.replaceAll(/[:.]/g, '-')}`;
const paths = process.env.AUDIT_PATHS?.split(',') || ['/', '/nft/nft-1'];
const profiles = process.env.AUDIT_PROFILES?.split(',') || ['mobile', 'desktop'];
const runCount = Number(process.env.AUDIT_RUNS || 3);
if (
  !Number.isInteger(runCount) ||
  runCount < 1 ||
  runCount > 5 ||
  paths.some((path) => !['/', '/nft/nft-1'].includes(path)) ||
  profiles.some((profile) => !['mobile', 'desktop'].includes(profile))
)
  throw new Error('Audit configuration must use known routes, profiles and 1–5 runs.');
await mkdir(outputDirectory, { recursive: true });
const lighthousePackage = JSON.parse(
  await readFile(`node_modules/${engine.packageName}/package.json`),
);
const rows = [];
let browserVersion;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
async function describeBuild(directory = 'dist', relativeDirectory = '') {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = `${relativeDirectory}${entry.name}`;
    if (entry.isDirectory())
      files.push(...(await describeBuild(`${directory}/${entry.name}`, relativePath + '/')));
    else {
      const body = await readFile(`${directory}/${entry.name}`);
      files.push({ path: relativePath, bytes: body.length, sha256: sha256(body) });
    }
  }
  return files;
}
const buildFiles = await describeBuild();
const buildFingerprint = sha256(JSON.stringify(buildFiles));
async function describeRuntimeSources() {
  const files = [
    ...(await describeBuild('src', 'src/')),
    ...(await describeBuild('public', 'public/')),
  ];
  for (const path of ['index.html', 'vite.config.ts', 'package.json', 'package-lock.json']) {
    const body = await readFile(path);
    files.push({ path, bytes: body.length, sha256: sha256(body) });
  }
  return files;
}
const runtimeSources = await describeRuntimeSources();
const runtimeSourceFingerprint = sha256(JSON.stringify(runtimeSources));
for (const file of runtimeSources.filter((file) => file.path.startsWith('public/'))) {
  const artifact = buildFiles.find((built) => built.path === file.path.slice('public/'.length));
  if (artifact?.sha256 !== file.sha256)
    throw new Error(`Public source changed after the production build: ${file.path}`);
}
const indexFingerprint = buildFiles.find((file) => file.path === 'index.html')?.sha256;
if (!indexFingerprint) throw new Error('A production dist/index.html is required.');
const expectedDocument = await readFile('dist/index.html');
const { hostedDocumentVerification, hostingConfigurationVerification } = await verifyHostedBuild({
  target,
  buildFiles,
  runtimeSources,
  expectedDocument,
});
const sourceRevision = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  changedFiles: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean),
};

// Check the functioning app before measurement. Each Lighthouse run still uses its own fresh profile.
async function preflight(path) {
  const browser = await chromium.launch({ headless: true });
  try {
    browserVersion = browser.version();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const navigation = await page.goto(target + path, { waitUntil: 'domcontentloaded' });
    if (!navigation)
      throw new Error(`Measured route does not serve the verified production document: ${path}`);
    const documentVerification = verifyHostedHtml(await navigation.body(), expectedDocument);
    await page
      .locator(path === '/' ? 'article.nft-card' : '.detail-grid')
      .first()
      .waitFor();
    await page.locator('.connection-dot.connected').waitFor({ state: 'attached' });
    const result = {
      url: page.url(),
      title: await page.title(),
      heading: await page.getByRole('heading', { level: 1 }).innerText(),
      theme: await page.locator('html').getAttribute('data-theme'),
      scripts: await page
        .locator('script[src]')
        .evaluateAll((scripts) => scripts.map((script) => script.getAttribute('src'))),
      api: await page.evaluate(async () => {
        const response = await fetch('/api/nfts');
        const data = await response.json();
        return { status: response.status, items: data.items?.length, total: data.total };
      }),
      realtimeConnected: true,
      pageErrors: errors,
      documentVerification,
    };
    if (
      errors.length ||
      result.api.status !== 200 ||
      !result.api.items ||
      result.scripts.some((source) => source?.includes('/@vite/') || source?.includes('/src/'))
    )
      throw new Error(`Application preflight failed: ${JSON.stringify(result)}`);
    return result;
  } finally {
    await browser.close();
  }
}

for (const path of paths) {
  for (const profile of profiles) {
    const functioningApplication = await preflight(path);
    const results = [];
    for (let run = 1; run <= runCount; run++) {
      if (sha256(JSON.stringify(await describeBuild())) !== buildFingerprint)
        throw new Error('The production build changed during the audit. Start a new complete run.');
      if (sha256(JSON.stringify(await describeRuntimeSources())) !== runtimeSourceFingerprint)
        throw new Error(
          'Runtime sources changed during the audit. Freeze sources and rebuild before retrying.',
        );
      const file = `${outputDirectory}/${path === '/' ? 'home' : 'detail'}-${profile}-${run}`;
      const args = [
        `node_modules/${engine.packageName}/cli/index.js`,
        target + path,
        '--output=json',
        '--output=html',
        `--output-path=${file}`,
        '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
        '--quiet',
        '--only-categories=performance,accessibility,best-practices,seo',
      ];
      if (profile === 'desktop') args.push('--preset=desktop');
      const exit = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, args, {
          stdio: 'inherit',
          env: { ...process.env, CHROME_PATH: chromium.executablePath() },
        });
        child.on('error', reject);
        child.on('exit', resolve);
      });
      if (exit !== 0) throw new Error(`Lighthouse failed: ${path} ${profile} ${run}`);
      const data = JSON.parse(await readFile(file + '.report.json', 'utf8'));
      if (data.runtimeError) throw new Error(JSON.stringify(data.runtimeError));
      if (new URL(data.finalDisplayedUrl).pathname !== path)
        throw new Error(`Unexpected measured route: ${data.finalDisplayedUrl}`);
      results.push({
        run,
        json: file + '.report.json',
        html: file + '.report.html',
        fetchTime: data.fetchTime,
        finalUrl: data.finalDisplayedUrl,
        categories: Object.fromEntries(
          Object.entries(data.categories).map(([key, value]) => [
            key,
            Math.round(value.score * 100),
          ]),
        ),
        FCP: data.audits['first-contentful-paint'].numericValue,
        LCP: data.audits['largest-contentful-paint'].numericValue,
        CLS: data.audits['cumulative-layout-shift'].numericValue,
        TBT: data.audits['total-blocking-time'].numericValue,
        config: {
          formFactor: data.configSettings.formFactor,
          throttlingMethod: data.configSettings.throttlingMethod,
          throttling: data.configSettings.throttling,
          screenEmulation: data.configSettings.screenEmulation,
          disableStorageReset: data.configSettings.disableStorageReset,
        },
        environment: data.environment,
        warnings: data.runWarnings,
      });
      console.log(
        `${path} ${profile} ${run}/${runCount}: ${results.at(-1).categories.performance}`,
      );
    }
    const median = (key) => {
      const ordered = results.map((result) => result.categories[key]).sort((a, b) => a - b);
      const middle = Math.floor(ordered.length / 2);
      return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
    };
    rows.push({
      path,
      profile,
      preflight: functioningApplication,
      medians: Object.fromEntries(
        ['performance', 'accessibility', 'best-practices', 'seo'].map((key) => [key, median(key)]),
      ),
      runs: results,
    });
  }
}
if (
  sha256(JSON.stringify(await describeBuild())) !== buildFingerprint ||
  sha256(JSON.stringify(await describeRuntimeSources())) !== runtimeSourceFingerprint
)
  throw new Error('The audited artifact or runtime sources changed before completion.');
const fullMatrix =
  runCount === 3 &&
  paths.length === 2 &&
  new Set(paths).size === 2 &&
  profiles.length === 2 &&
  new Set(profiles).size === 2;
const categoryThresholds = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 90 };
const officialMediansMet = rows.every((row) =>
  Object.entries(categoryThresholds).every(
    ([category, minimum]) => row.medians[category] >= minimum,
  ),
);
const allPerformanceRunsAbove90 = rows.every((row) =>
  row.runs.every((run) => run.categories.performance > 90),
);
const allCategoryRunsAbove80 = rows.every((row) =>
  row.runs.every((run) => Object.values(run.categories).every((score) => score > 80)),
);
const gate = {
  scope: 'Official challenge medians reported separately from the candidate acceptance above 8/10.',
  completeMatrix: fullMatrix,
  categoryThresholds,
  officialMediansMet,
  allPerformanceRunsAbove90,
  allCategoryRunsAbove80,
  candidateAcceptance: {
    date: '2026-10-27',
    minimumExclusive: 80,
    source: 'Se as notas ficarem acima de 8 esta aprovado, preciso mandar ainda hoje.',
  },
  approved: fullMatrix && allCategoryRunsAbove80,
  aspirations: {
    mobilePerformanceMediansAtLeast95: rows
      .filter((row) => row.profile === 'mobile')
      .every((row) => row.medians.performance >= 95),
    requiredForApproval: false,
  },
};

const summary = {
  startedAt,
  completedAt: new Date().toISOString(),
  node: process.version,
  lighthouse: lighthousePackage.version,
  engine,
  browser: `Playwright Chromium ${browserVersion}`,
  target,
  build: {
    fingerprint: buildFingerprint,
    files: buildFiles,
    sourceRevision,
    runtimeSourceFingerprint,
    runtimeSources,
    hostedDocumentVerification,
    hostingConfigurationVerification,
  },
  methodology:
    'Production build verified against served artifact SHA256 hashes. Only the exact reviewed _headers configuration may be consumed rather than served, after matching local source/build hashes and verifying HTTP 200, cache policies and document/asset identity for both measured routes, a hashed JavaScript asset and the service worker; its identity and runtime evidence are recorded. A byte-identical raw _headers response remains verified as bytes and is explicitly recorded as unsupported configuration. For HTML only, the exact observed Cloudflare JSD template may be recognized, permitting only its volatile ray ID and timestamp; the remaining application document must be byte-identical. Raw, script/template and normalized hashes are recorded. The browser still receives and measures the original HTML and all platform resources unchanged. Sequential Lighthouse navigations, default Lighthouse simulated throttling, fresh browser storage per measured run. No audit-level request blocking or network overrides; application MSW and Socket.IO simulation run unchanged. Preflight rejects the development server and verifies API data, visible page and Socket.IO connection. Every run is retained; median does not discard any run.',
  outputDirectory,
  gate,
  rows,
};
await writeFile(`${outputDirectory}/${engine.summary}`, JSON.stringify(summary, null, 2));
if (fullMatrix)
  await writeFile(`reports/lighthouse/${engine.summary}`, JSON.stringify(summary, null, 2));
console.log(
  JSON.stringify(
    {
      outputDirectory,
      gate,
      rows: rows.map(({ path, profile, medians }) => ({ path, profile, medians })),
    },
    null,
    2,
  ),
);
if (fullMatrix && !gate.approved) process.exitCode = 1;
