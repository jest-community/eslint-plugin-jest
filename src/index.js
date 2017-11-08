// @flow

import noDisabledTests from './rules/no_disabled_tests';
import noFocusedTests from './rules/no_focused_tests';
import noIdenticalTitle from './rules/no_identical_title';
import preferToHaveLength from './rules/prefer_to_have_length';
import validExpect from './rules/valid_expect';

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
