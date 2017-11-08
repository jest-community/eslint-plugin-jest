'use strict';

const noDisabledTests = require('./rules/no_disabled_tests');
const noFocusedTests = require('./rules/no_focused_tests');
const noIdenticalTitle = require('./rules/no_identical_title');
const preferToHaveLength = require('./rules/prefer_to_have_length');
const validExpect = require('./rules/valid_expect');

module.exports = {
  configs: {
    recommended: {
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
      },
    },
  },
  environments: {
    globals: {
      globals: {
        afterAll: false,
        afterEach: false,
        beforeAll: false,
        beforeEach: false,
        describe: false,
        expect: false,
        fit: false,
        it: false,
        jasmine: false,
        jest: false,
        pending: false,
        pit: false,
        require: false,
        test: false,
        xdescribe: false,
        xit: false,
        xtest: false,
      },
    },
  },
  rules: {
    'no-disabled-tests': noDisabledTests,
    'no-focused-tests': noFocusedTests,
    'no-identical-title': noIdenticalTitle,
    'prefer-to-have-length': preferToHaveLength,
    'valid-expect': validExpect,
  },
};
