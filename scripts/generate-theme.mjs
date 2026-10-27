import { format } from 'prettier';
import { build } from 'vite';
import { writeFile, mkdir, rm } from 'node:fs/promises';
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
const { theme } = await import(pathToFileURL(dir.pathname + 'theme.mjs').href + '?v=' + Date.now());
const kebab = (value) => value.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
const variables = Object.entries(theme.semanticTokens.colors).map(
  ([name, value]) => `  --${kebab(name)}: ${value};`,
);
for (const [name, value] of Object.entries(theme.tokens.fonts))
  variables.push(`  --font-${name}: ${value};`);
for (const [name, value] of Object.entries(theme.tokens.spacing))
  variables.push(`  --space-${name}: ${value};`);
for (const [name, value] of Object.entries(theme.tokens.radii)) {
  variables.push(`  --radius-${name}: ${value};`);
}
for (const [name, value] of Object.entries(theme.tokens.breakpoints)) {
  variables.push(`  --breakpoint-${name}: ${value};`);
}
variables.push(`  --radius: ${theme.tokens.radii.md};`);
await writeFile(
  'src/styleguide/theme/theme.generated.css',
  await format(':root {\n' + variables.join('\n') + '\n}\n', { parser: 'css' }),
);
await rm(dir, { recursive: true, force: true });

const sourceStyles = await (
  await import('node:fs/promises')
).readFile('src/styles.template.css', 'utf8');
let compiledStyles = sourceStyles;
for (const [name, value] of Object.entries(theme.tokens.breakpoints)) {
  compiledStyles = compiledStyles.replaceAll(`__BREAKPOINT_${name.toUpperCase()}__`, value);
}
await writeFile('src/styles.css', await format(compiledStyles, { parser: 'css' }));
