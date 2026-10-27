import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';

const testFiles = ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'];
const mockImports = {
  group: ['**/mocks', '**/mocks/**'],
  message: 'Application code must use services. Only bootstrap and tests may import mocks.',
};
const inlineStyleRestrictions = [
  {
    selector: 'JSXAttribute[name.name="style"]',
    message: 'Use stylesheet classes or data attributes instead of inline styles.',
  },
  {
    selector:
      'CallExpression[callee.type="MemberExpression"][callee.property.name="setAttribute"][arguments.0.value="style"]',
    message: 'Use stylesheet classes or data attributes instead of setting the style attribute.',
  },
];

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      '.vercel/**',
      'node_modules/**',
      'public/mockServiceWorker.js',
      'playwright-report/**',
      'test-results*/**',
      'reports/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': hooks },
    rules: {
      ...hooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': ['error', ...inlineStyleRestrictions],
      'no-restricted-properties': [
        'error',
        {
          property: 'style',
          message: 'Use stylesheet classes or data attributes instead of CSSOM style access.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [...testFiles, 'src/mocks/**', 'src/main.tsx'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [mockImports] }],
      'no-restricted-syntax': [
        'error',
        ...inlineStyleRestrictions,
        {
          selector: String.raw`ImportExpression[source.value=/(^|\u002f)mocks(\u002f|$)/]`,
          message: 'Only bootstrap and tests may load the simulated transport.',
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    ignores: testFiles,
    rules: {
      'no-restricted-syntax': [
        'error',
        ...inlineStyleRestrictions,
        {
          selector: String.raw`ImportExpression[source.value=/(^|\u002f)mocks(\u002f|$)/]`,
          message: 'Domain code cannot load mocks.',
        },
        {
          selector: String.raw`ImportExpression[source.value=/^(react|react-dom|@tanstack|axios|socket.io-client|msw)(\u002f|$)/]`,
          message: 'Domain code cannot load UI or transport packages.',
        },
        {
          selector: String.raw`ImportExpression[source.value=/(^|\u002f)(services|components|modules|styleguide|app)(\u002f|$)/]`,
          message: 'Domain code cannot load application layers.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            mockImports,
            {
              group: [
                'react',
                'react/*',
                'react-dom',
                'react-dom/*',
                '@tanstack/*',
                'axios',
                'socket.io-client',
                'msw',
                'msw/*',
                '**/services',
                '**/services/**',
                '**/components',
                '**/components/**',
                '**/modules',
                '**/modules/**',
                '**/styleguide',
                '**/styleguide/**',
                '**/app',
                '**/app/**',
              ],
              message:
                'Domain code must remain independent from UI, transport and application layers.',
            },
          ],
        },
      ],
    },
  },
);
