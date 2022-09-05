import plugin from '../src';

enum MESSAGE_TYPE {
  CONFIGS = 1,
  DEPRECATED = 2,
  FIXABLE = 3,
  HAS_SUGGESTIONS = 4,
}

export const MESSAGES = {
  [MESSAGE_TYPE.CONFIGS]:
    '💼 This rule is enabled in the following [configs](https://github.com/jest-community/eslint-plugin-jest#shareable-configurations):',
  [MESSAGE_TYPE.DEPRECATED]: '❌ This rule is deprecated.',
  [MESSAGE_TYPE.FIXABLE]:
    '🔧 This rule is automatically fixable using the `--fix` [option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) on the command line.',
  [MESSAGE_TYPE.HAS_SUGGESTIONS]:
    '💡 This rule provides [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions) that can be applied manually.',
};

type RuleName = keyof typeof plugin.rules;
type Rule = typeof plugin.rules[RuleName];

function getConfigsForRule(ruleName: RuleName) {
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

/**
 * Determine which notices should and should not be included at the top of a rule doc.
 */
export function getNoticesForRule(rule: Rule) {
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

  return {
    expectedNotices,
    unexpectedNotices,
  };
}

/**
 * Get the lines for the notice section at the top of a rule doc.
 */
export function getRuleNoticeLines(ruleName: RuleName) {
  const lines: string[] = [];

  const { expectedNotices } = getNoticesForRule(plugin.rules[ruleName]);

  expectedNotices.forEach(expectedNotice => {
    lines.push(''); // Blank line first.

    if (expectedNotice === MESSAGE_TYPE.CONFIGS) {
      // This notice should have a list of the rule's configs.
      const configsEnabled = getConfigsForRule(ruleName);
      const message = `${MESSAGES[MESSAGE_TYPE.CONFIGS]} ${configNamesToList(
        configsEnabled,
      )}.`;

      lines.push(message);
    } else {
      lines.push(MESSAGES[expectedNotice]);
    }
  });

  return lines;
}
