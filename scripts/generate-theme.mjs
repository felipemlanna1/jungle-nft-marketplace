import { format } from 'prettier';
import { build } from 'vite';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
// Compile theme data in isolation. Components and application services never execute here.
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
const { themes } = await import(
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
      name === 'expedition' ? `:root, :root[data-theme='${name}']` : `:root[data-theme='${name}']`;
    return selector + ' {\n' + serializeTheme(value) + '\n}';
  })
  .join('\n\n');
await writeFile(
  'src/styleguide/theme/theme.generated.css',
  await format(generated, { parser: 'css' }),
);
await rm(dir, { recursive: true, force: true });

async function compileStyles(sources, target) {
  let compiledStyles = (await Promise.all(sources.map((source) => readFile(source, 'utf8')))).join(
    '\n',
  );
  for (const [name, value] of Object.entries(themes.expedition.tokens.breakpoints)) {
    compiledStyles = compiledStyles.replaceAll(`__BREAKPOINT_${name.toUpperCase()}__`, value);
  }
  await writeFile(target, await format(compiledStyles, { parser: 'css' }));
}
await compileStyles(['src/styles.template.css'], 'src/styles.css');
await compileStyles(
  ['shell', 'primitives', 'catalog', 'flows'].map(
    (name) => `src/styleguide/theme/expedition/styles/${name}.template.css`,
  ),
  'src/styles.expedition.css',
);
