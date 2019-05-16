'use strict';

const fs = require('fs');
const path = require('path');
const { rules } = require('../');

const ruleNames = Object.keys(rules);
const numberOfRules = 32;

describe('rules', () => {
  it('should have a corresponding doc for each rule', () => {
    ruleNames.forEach(rule => {
      const docPath = path.resolve(__dirname, '../../docs/rules', `${rule}.md`);

      if (!fs.existsSync(docPath)) {
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
