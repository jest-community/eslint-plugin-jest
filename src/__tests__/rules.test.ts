import { existsSync } from 'fs';
import { resolve } from 'path';
import plugin from '../';

const numberOfRules = 63;
const ruleNames = Object.keys(plugin.rules);
const deprecatedRules = Object.entries(plugin.rules)
  .filter(([, rule]) => rule.meta.deprecated)
  .map(([name]) => name);

describe('rules', () => {
  it('should have a corresponding doc for each rule', () => {
    ruleNames.forEach(rule => {
      const docPath = resolve(__dirname, '../../docs/rules', `${rule}.md`);

      if (!existsSync(docPath)) {
        throw new Error(
          `Could not find documentation file for rule "${rule}" in path "${docPath}"`,
        );
      }
    });
  });

  it('should have a corresponding test for each rule', () => {
    ruleNames.forEach(rule => {
      const testPath = resolve(
        __dirname,
        '../rules/__tests__/',
        `${rule}.test.ts`,
      );

      if (!existsSync(testPath)) {
        throw new Error(
          `Could not find test file for rule "${rule}" in path "${testPath}"`,
        );
      }
    });
  });

  it('should have the correct amount of rules', () => {
    const { length } = ruleNames;

    if (length !== numberOfRules) {
      throw new Error(
        `There should be exactly ${numberOfRules} rules, but there are ${length}. If you've added a new rule, please update this number.`,
      );
    }
  });

  it('should export configs that refer to actual rules', () => {
    const expectJestPlugin = expect.objectContaining({
      meta: {
        name: 'eslint-plugin-jest',
        version: expect.any(String),
      },
    });

    const recommendedConfigs = plugin.configs;

    expect(recommendedConfigs).toMatchSnapshot({
      'flat/recommended': { plugins: { jest: expectJestPlugin } },
      'flat/style': { plugins: { jest: expectJestPlugin } },
      'flat/all': { plugins: { jest: expectJestPlugin } },
    });
    expect(Object.keys(recommendedConfigs)).toEqual([
      'all',
      'recommended',
      'style',
      'flat/all',
      'flat/recommended',
      'flat/style',
    ]);
    expect(Object.keys(recommendedConfigs.all.rules)).toHaveLength(
      ruleNames.length - deprecatedRules.length,
    );
    expect(Object.keys(recommendedConfigs['flat/all'].rules)).toHaveLength(
      ruleNames.length - deprecatedRules.length,
    );
    const allConfigRules = Object.values(recommendedConfigs).flatMap(config =>
      Object.keys(config.rules ?? {}),
    );

    allConfigRules.forEach(rule => {
      const ruleNamePrefix = 'jest/';
      const ruleName = rule.slice(ruleNamePrefix.length);

      expect(rule.startsWith(ruleNamePrefix)).toBe(true);
      expect(ruleNames).toContain(ruleName);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      expect(() => require(`../rules/${ruleName}`)).not.toThrow();
    });
  });
});
