import { existsSync, readFileSync } from 'fs';
import { EOL } from 'os';
import { join, resolve } from 'path';
import plugin from '../';
import {
  MESSAGES,
  getNoticesForRule,
  getRuleNoticeLines,
} from '../../tools/rule-notices';

const numberOfRules = 50;
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
    const recommendedConfigs = plugin.configs;

    expect(recommendedConfigs).toMatchSnapshot();
    expect(Object.keys(recommendedConfigs)).toEqual([
      'all',
      'recommended',
      'style',
    ]);
    expect(Object.keys(recommendedConfigs.all.rules)).toHaveLength(
      ruleNames.length - deprecatedRules.length,
    );
    const allConfigRules = Object.values(recommendedConfigs)
      .map(config => Object.keys(config.rules))
      .reduce((previousValue, currentValue) => [
        ...previousValue,
        ...currentValue,
      ]);

    allConfigRules.forEach(rule => {
      const ruleNamePrefix = 'jest/';
      const ruleName = rule.slice(ruleNamePrefix.length);

      expect(rule.startsWith(ruleNamePrefix)).toBe(true);
      expect(ruleNames).toContain(ruleName);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      expect(() => require(`../rules/${ruleName}`)).not.toThrow();
    });
  });

  describe('rule documentation files have the correct content', () => {
    it.each(ruleNames)('%s', ruleName => {
      const rule = plugin.rules[ruleName];
      const documentPath = join('docs', 'rules', `${ruleName}.md`);
      const documentContents = readFileSync(documentPath, 'utf8');
      const documentLines = documentContents.split(EOL);

      // Check title.
      const expectedTitle = `# ${rule.meta.docs.description} (\`${ruleName}\`)`;

      expect(documentLines[0]).toStrictEqual(expectedTitle);

      // Ensure that expected notices are present in the correct order.
      const noticeLines = getRuleNoticeLines(ruleName);
      const NOTICE_START_LINE = 3;

      noticeLines.forEach((noticeLine, index) =>
        expect(documentLines[index + NOTICE_START_LINE]).toStrictEqual(
          noticeLine,
        ),
      );

      // Ensure that unexpected notices are not present.
      const { unexpectedNotices } = getNoticesForRule(rule);

      unexpectedNotices.forEach(unexpectedNotice => {
        expect(
          documentContents.includes(MESSAGES[unexpectedNotice]),
        ).toStrictEqual(false);
      });

      // Check for Rule Details section.
      expect(documentContents).toContain('## Rule Details');

      // Check if the rule has configuration options.
      if (
        (Array.isArray(rule.meta.schema) && rule.meta.schema.length > 0) ||
        (typeof rule.meta.schema === 'object' &&
          Object.keys(rule.meta.schema).length > 0)
      ) {
        // Should have an options section header:
        expect(documentContents).toContain('## Options');
      } else {
        // Should NOT have any options section header:
        expect(documentContents.includes('## Options')).toStrictEqual(false);
        expect(documentContents.includes('## Config')).toStrictEqual(false);
      }
    });
  });
});
