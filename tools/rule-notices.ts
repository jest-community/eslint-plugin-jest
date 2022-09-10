import plugin from '../src';

enum MESSAGE_TYPE {
  CONFIGS = 'configs',
  DEPRECATED = 'deprecated',
  FIXABLE = 'fixable',
  HAS_SUGGESTIONS = 'hasSuggestions',
}

export const MESSAGES = {
  [MESSAGE_TYPE.CONFIGS]:
    '💼 This rule is enabled in the following [configs](https://github.com/jest-community/eslint-plugin-jest/blob/main/README.md#shareable-configurations):',
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
    const value = config.rules[`jest/${ruleName}`];
    const isEnabled = [2, 'error'].includes(value);

    if (isEnabled) {
      configNames.push(configName);
    }
  }

  return configNames.sort();
}

/**
 * Convert list of configs to string list of formatted names.
 */
function configNamesToList(configNames: readonly string[]) {
  return `\`${configNames.join('`, `')}\``;
}

/**
 * Convert list of rule names to string list of links.
 */
function rulesNamesToList(ruleNames: readonly string[]) {
  return ruleNames.map(ruleName => `[${ruleName}](${ruleName}.md)`).join(', ');
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

  const rule = plugin.rules[ruleName];
  const notices = getNoticesForRule(rule);
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
    } else if (messageType === MESSAGE_TYPE.DEPRECATED) {
      // This notice should include links to the replacement rule(s) if available.
      const message = rule.meta.replacedBy
        ? `${MESSAGES[messageType]} It was replaced by ${rulesNamesToList(
            rule.meta.replacedBy,
          )}.`
        : MESSAGES[messageType];

      lines.push(message);
    } else {
      lines.push(MESSAGES[messageType]);
    }
  }

  return lines;
}
