import { format, resolveConfig } from 'prettier';
import { build } from 'vite';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolveBreakpoints } from './lib/resolve-breakpoints.mjs';
const formatOptions = { ...(await resolveConfig('src/styles.css')), parser: 'css' };
const dir = new URL('../node_modules/.cache/kurio-theme/', import.meta.url);
await mkdir(dir, { recursive: true });
await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    lib: { entry: 'src/styleguide/theme/index.ts', formats: ['es'], fileName: () => 'theme.mjs' },
    outDir: dir.pathname,
    emptyOutDir: true,
    minify: false,
  },
});
const { themes, DEFAULT_THEME } = await import(
  pathToFileURL(dir.pathname + 'theme.mjs').href + '?v=' + Date.now()
);
const kebab = (value) => value.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
function serializeTheme(theme) {
  const variables = Object.entries(theme.semanticTokens.colors).map(
    ([name, value]) => `  --${kebab(name)}: ${value};`,
  );
  for (const [name, value] of Object.entries(theme.tokens.fonts))
    variables.push(`  --font-${name}: ${value};`);
  for (const [name, value] of Object.entries(theme.tokens.spacing))
    variables.push(`  --space-${name}: ${value};`);
  for (const [name, value] of Object.entries(theme.tokens.radii))
    variables.push(`  --radius-${name}: ${value};`);
  for (const [name, value] of Object.entries(theme.tokens.breakpoints))
    variables.push(`  --breakpoint-${name}: ${value};`);
  variables.push(`  --radius: ${theme.tokens.radii.md};`);
  return variables.join('\n');
}
const generated = Object.entries(themes)
  .map(([name, value]) => {
    const selector =
      name === DEFAULT_THEME ? `:root, :root[data-theme='${name}']` : `:root[data-theme='${name}']`;
    return selector + ' {\n' + serializeTheme(value) + '\n}';
  })
  .join('\n\n');
await writeFile('src/styleguide/theme/theme.generated.css', await format(generated, formatOptions));
await rm(dir, { recursive: true, force: true });

async function compileStyles(sources, target) {
  let compiledStyles = (await Promise.all(sources.map((source) => readFile(source, 'utf8')))).join(
    '\n',
  );
  compiledStyles = resolveBreakpoints(compiledStyles, themes[DEFAULT_THEME].tokens.breakpoints);
  await writeFile(target, await format(compiledStyles, formatOptions));
}
await compileStyles(['src/styles.template.css'], 'src/styles.css');
await compileStyles(
  [
    ...['shell', 'catalog', 'account', 'commerce'].map(
      (name) => `src/styleguide/theme/kurio/styles/${name}.template.css`,
    ),
    'src/styleguide/components/QuantityInput/styles.template.css',
    'src/modules/catalog/components/NftGallery/styles.template.css',
    'src/modules/catalog/components/RelatedNfts/styles.template.css',
    'src/modules/catalog/pages/NftDetails/styles.template.css',
    'src/modules/checkout/pages/Checkout/styles.template.css',
    'src/styleguide/theme/kurio/styles/cart-order.template.css',
  ],
  'src/styles.kurio.css',
);
