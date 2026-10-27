import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
if (mode !== '--check' && mode !== '--write') throw new Error('Choose --check or --write.');
const targets = [
  'src',
  'scripts',
  'tests',
  'docs',
  '.github',
  '*.ts',
  '*.js',
  '*.json',
  '*.jsonc',
  '*.html',
  '*.md',
];
const prettier = fileURLToPath(
  new URL('../node_modules/prettier/bin/prettier.cjs', import.meta.url),
);
const result = spawnSync(process.execPath, [prettier, mode, '--ignore-unknown', ...targets], {
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
