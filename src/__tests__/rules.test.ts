import { existsSync } from 'fs';
import { resolve } from 'path';
import plugin from '../';

const excludeRules = [
  // require-tothrow-message has been renamed to require-to-throw-message, remove in major version bump
  'require-tothrow-message',
];

const ruleNames = Object.keys(plugin.rules).filter(rule => {
  return excludeRules.includes(rule) === false;
});

const numberOfRules = 39;

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

  it('should have the correct amount of rules', () => {
    const { length } = ruleNames;
    if (length !== numberOfRules) {
      throw new Error(
        `There should be exactly ${numberOfRules} rules, but there are ${length}. If you've added a new rule, please update this number.`,
      );
    }
  });
});
