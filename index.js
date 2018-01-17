'use strict';

const noDisabledTests = require('./rules/no_disabled_tests');
const noFocusedTests = require('./rules/no_focused_tests');
const noIdenticalTitle = require('./rules/no_identical_title');
const noLargeSnapshots = require('./rules/no_large_snapshots');
const preferToBeNull = require('./rules/prefer_to_be_null');
const preferToBeUndefined = require('./rules/prefer_to_be_undefined');
const preferToHaveLength = require('./rules/prefer_to_have_length');
const validExpect = require('./rules/valid_expect');
const preferExpectAssertions = require('./rules/prefer_expect_assertions');
const validExpectInPromise = require('./rules/valid_expect_in_promise');

const snapshotProcessor = require('./processors/snapshot-processor');

module.exports = {
  configs: {
    recommended: {
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
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
  processors: {
    '.snap': snapshotProcessor,
  },
  rules: {
    'no-disabled-tests': noDisabledTests,
    'no-focused-tests': noFocusedTests,
    'no-identical-title': noIdenticalTitle,
    'no-large-snapshots': noLargeSnapshots,
    'prefer-to-be-null': preferToBeNull,
    'prefer-to-be-undefined': preferToBeUndefined,
    'prefer-to-have-length': preferToHaveLength,
    'valid-expect': validExpect,
    'prefer-expect-assertions': preferExpectAssertions,
    'valid-expect-in-promise': validExpectInPromise,
  },
};
