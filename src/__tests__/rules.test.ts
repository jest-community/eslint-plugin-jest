import { existsSync, readFileSync } from 'fs';
import { EOL } from 'os';
import { join, resolve } from 'path';
import plugin from '../';

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
    enum MESSAGE_TYPE {
      CONFIGS = 1,
      DEPRECATED = 2,
      FIXABLE = 3,
      HAS_SUGGESTIONS = 4,
    }
    const MESSAGES = {
      [MESSAGE_TYPE.CONFIGS]:
        '💼 This rule is enabled in the following [configs](https://github.com/jest-community/eslint-plugin-jest#shareable-configurations):',
      [MESSAGE_TYPE.DEPRECATED]: '❌ This rule is deprecated.',
      [MESSAGE_TYPE.FIXABLE]:
        '🔧 This rule is automatically fixable using the `--fix` [option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) on the command line.',
      [MESSAGE_TYPE.HAS_SUGGESTIONS]:
        '💡 This rule is manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).',
    };

    function getConfigsForRule(ruleName: keyof typeof plugin.rules) {
      const { configs } = plugin;
      const configNames: Array<keyof typeof configs> = [];
      let configName: keyof typeof configs;

      for (configName in configs) {
        const config = configs[configName];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- we don't have a static type for rule names
        // @ts-ignore
        const value = config.rules[`jest/${ruleName}`];
        const isEnabled = [2, 'error'].includes(value);

        if (isEnabled) {
          configNames.push(configName);
        }
      }

      return configNames.sort();
    }

    function configNamesToList(configNames: string[]) {
      return `\`${configNames.join('`, `')}\``;
    }

    it.each(ruleNames)('%s', ruleName => {
      const rule = plugin.rules[ruleName];
      const documentPath = join('docs', 'rules', `${ruleName}.md`);
      const documentContents = readFileSync(documentPath, 'utf8');
      const documentLines = documentContents.split(EOL);

      // Check title.
      const expectedTitle = `# ${rule.meta.docs.description} (\`${ruleName}\`)`;

      expect(documentLines[0]).toStrictEqual(expectedTitle); // Includes the rule description and name in title.

      // Decide which notices should be shown at the top of the doc.
      const expectedNotices: MESSAGE_TYPE[] = [];
      const unexpectedNotices: MESSAGE_TYPE[] = [];

      if (rule.meta.deprecated) {
        expectedNotices.push(MESSAGE_TYPE.DEPRECATED);
        unexpectedNotices.push(MESSAGE_TYPE.CONFIGS);
      } else {
        unexpectedNotices.push(MESSAGE_TYPE.DEPRECATED);
        expectedNotices.push(MESSAGE_TYPE.CONFIGS);
      }
      if (rule.meta.fixable) {
        expectedNotices.push(MESSAGE_TYPE.FIXABLE);
      } else {
        unexpectedNotices.push(MESSAGE_TYPE.FIXABLE);
      }
      if (rule.meta.hasSuggestions) {
        expectedNotices.push(MESSAGE_TYPE.HAS_SUGGESTIONS);
      } else {
        unexpectedNotices.push(MESSAGE_TYPE.HAS_SUGGESTIONS);
      }

      // Ensure that expected notices are present in the correct order.
      let currentLineNumber = 1;

      expectedNotices.forEach(expectedNotice => {
        expect(documentLines[currentLineNumber]).toStrictEqual(''); // Blank line first.

        if (
          documentLines[currentLineNumber + 1] === '<!-- prettier-ignore -->'
        ) {
          // Ignore any Prettier ignore comment that may be needed so that the notice doesn't get split onto multiple lines.
          currentLineNumber++;
        }

        if (expectedNotice === MESSAGE_TYPE.CONFIGS) {
          // Check that the rule has a notice with a list of its configs.
          const configsEnabled = getConfigsForRule(ruleName);
          const expectedMessage = `${
            MESSAGES[MESSAGE_TYPE.CONFIGS]
          } ${configNamesToList(configsEnabled)}.`;

          expect(documentLines[currentLineNumber + 1]).toStrictEqual(
            expectedMessage,
          );
        } else {
          // For other notice types, just check the whole line.
          expect(documentLines[currentLineNumber + 1]).toStrictEqual(
            MESSAGES[expectedNotice],
          );
        }
        currentLineNumber += 2;
      });

      // Ensure that unexpected notices are not present.
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
