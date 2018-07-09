'use strict';

const fs = require('fs');
const path = require('path');
const { rules } = require('../index');

describe('rules', () => {
  it('should have a corresponding doc for each rule', () => {
    Object.keys(rules).forEach(rule => {
      const docPath = path.resolve(__dirname, '../docs/rules', `${rule}.md`);

      if (!fs.existsSync(docPath)) {
        throw new Error(
          `Could not find documentation file for rule "${rule}" in path "${docPath}"`
        );
      }
    });
  });
});
