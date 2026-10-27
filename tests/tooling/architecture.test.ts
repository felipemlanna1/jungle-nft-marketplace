import { ESLint } from 'eslint';
import { beforeAll, describe, expect, it } from 'vitest';

const eslint = new ESLint();
beforeAll(async () => {
  await eslint.calculateConfigForFile('src/modules/account/hooks/probe.ts');
}, 20_000);

describe('application import boundaries', () => {
  it.each([
    [
      'src/modules/account/hooks/probe.ts',
      'import { handlers } from "../../../mocks/handlers"; void handlers;',
      true,
    ],
    ['src/services/probe.ts', 'import { handlers } from "../mocks/handlers"; void handlers;', true],
    ['src/domain/probe.ts', 'import { useState } from "react"; void useState;', true],
    ['src/domain/probe.ts', 'import { market } from "../services/marketplace"; void market;', true],
    [
      'src/domain/probe.test.ts',
      'import { handlers } from "../mocks/handlers"; void handlers;',
      false,
    ],
    ['src/main.tsx', 'import { handlers } from "./mocks/handlers"; void handlers;', false],
  ])('enforces static imports in %s', async (filePath, source, forbidden) => {
    const [result] = await eslint.lintText(source, { filePath });
    expect(result.messages.some((message) => message.ruleId === 'no-restricted-imports')).toBe(
      forbidden,
    );
  });

  it.each([
    ['src/modules/account/hooks/probe.ts', '../mocks/browser', true],
    ['src/modules/account/hooks/probe.ts', '../mocksmith', false],
    ['src/domain/probe.ts', 'react', true],
    ['src/domain/probe.ts', '../services/marketplace', true],
    ['src/domain/probe.ts', '../app/routes', true],
    ['src/domain/probe.ts', './applyDiscount', false],
    ['src/domain/probe.test.ts', '../mocks/browser', false],
    ['src/main.tsx', './mocks/browser', false],
  ])('enforces dynamic imports in %s from %s', async (filePath, path, forbidden) => {
    const [result] = await eslint.lintText(`void import('${path}');`, { filePath });
    expect(result.messages.some((message) => message.ruleId === 'no-restricted-syntax')).toBe(
      forbidden,
    );
  });
});
