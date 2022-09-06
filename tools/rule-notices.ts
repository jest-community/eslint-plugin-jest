import plugin from '../src';

enum MESSAGE_TYPE {
  CONFIGS = 'configs',
  DEPRECATED = 'deprecated',
  FIXABLE = 'fixable',
  HAS_SUGGESTIONS = 'hasSuggestions',
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

type Rule = typeof plugin.rules[string];

/**
 * Get config names that a given rule belongs to.
 */
function getConfigsForRule(ruleName: string) {
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

/**
 * Convert list of configs to formatted string list.
 */
function configNamesToList(configNames: string[]) {
  return `\`${configNames.join('`, `')}\``;
}

/**
 * Determine which notices should and should not be included at the top of a rule doc.
 */
export function getNoticesForRule(rule: Rule) {
  const notices: {
    [key in MESSAGE_TYPE]: boolean;
  } = {
    [MESSAGE_TYPE.CONFIGS]: !rule.meta.deprecated,
    [MESSAGE_TYPE.DEPRECATED]: rule.meta.deprecated || false,
    [MESSAGE_TYPE.FIXABLE]: Boolean(rule.meta.fixable),
    [MESSAGE_TYPE.HAS_SUGGESTIONS]: rule.meta.hasSuggestions || false,
  };

  return notices;
}

/**
 * Get the lines for the notice section at the top of a rule doc.
 */
export function getRuleNoticeLines(ruleName: string) {
  const lines: string[] = [];

  const notices = getNoticesForRule(plugin.rules[ruleName]);
  let messageType: keyof typeof notices;

  for (messageType in notices) {
    const expected = notices[messageType];

    if (!expected) {
      // This notice should not be included.
      continue;
    }

    lines.push(''); // Blank line first.

    if (messageType === MESSAGE_TYPE.CONFIGS) {
      // This notice should have a list of the rule's configs.
      const configsEnabled = getConfigsForRule(ruleName);
      const message = `${MESSAGES[MESSAGE_TYPE.CONFIGS]} ${configNamesToList(
        configsEnabled,
      )}.`;

      lines.push(message);
    } else {
      lines.push(MESSAGES[messageType]);
    }
  }

  return lines;
}
