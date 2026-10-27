import { ESLint, Linter } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

const eslint = new ESLint();
const linter = new Linter();
const filePaths = [
  'src/modules/catalog/components/probe.tsx',
  'src/domain/probe.tsx',
  'src/services/probe.tsx',
  'src/main.tsx',
  'src/mocks/probe.tsx',
  'src/modules/catalog/components/probe.test.tsx',
];
const configs = new Map<string, Linter.Config>();

beforeAll(async () => {
  for (const filePath of filePaths) {
    configs.set(filePath, await eslint.calculateConfigForFile(filePath));
  }
}, 20_000);

function violations(source: string, filePath: string) {
  const config = configs.get(filePath);
  if (!config) throw new Error(`Missing ESLint configuration for ${filePath}.`);
  const { languageOptions, linterOptions, plugins, rules, settings } = config;
  return linter.verify(
    source,
    [
      {
        files: ['**/*.{ts,tsx}'],
        languageOptions,
        linterOptions,
        plugins,
        rules,
        settings: settings ?? {},
      },
    ],
    filePath,
  );
}

describe('source styles remain in stylesheets', () => {
  it.each(filePaths)('rejects JSX styles and CSSOM access in %s', (filePath) => {
    const jsx = violations(
      'export const Probe = () => <div style={{ color: "red" }} />;',
      filePath,
    );
    expect(jsx.filter((message) => message.ruleId === 'no-restricted-syntax')).toHaveLength(1);
    const cssom = violations(
      'const element = document.createElement("div"); element.style.color = "red";',
      filePath,
    );
    expect(cssom.filter((message) => message.ruleId === 'no-restricted-properties')).toHaveLength(
      1,
    );
  });

  it.each([
    'const element = document.createElement("div"); element["style"].setProperty("color", "red");',
    'const element = document.createElement("div"); const { style } = element; void style;',
  ])('rejects indirect CSSOM access: %s', (source) => {
    const messages = violations(source, filePaths[0]);
    expect(
      messages.filter((message) => message.ruleId === 'no-restricted-properties'),
    ).toHaveLength(1);
  });

  it('rejects setting the inline style attribute', () => {
    const messages = violations(
      'const element = document.createElement("div"); element.setAttribute("style", "color: red");',
      filePaths[0],
    );
    expect(messages.filter((message) => message.ruleId === 'no-restricted-syntax')).toHaveLength(1);
  });

  it.each(filePaths)('allows stylesheet classes and data state in %s', (filePath) => {
    const messages = violations(
      'export const Probe = () => <div className="artwork" data-state="selected" />; const element = document.createElement("div"); element.classList.add("active"); element.dataset.state = "selected";',
      filePath,
    );
    expect(messages).toEqual([]);
  });
});
