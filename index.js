'use strict';

const alwaysTestOrIt = require('./rules/always-test-or-it');
const noDisabledTests = require('./rules/no-disabled-tests');
const noFocusedTests = require('./rules/no-focused-tests');
const noIdenticalTitle = require('./rules/no-identical-title');
const noLargeSnapshots = require('./rules/no-large-snapshots');
const preferToBeNull = require('./rules/prefer-to-be-null');
const preferToBeUndefined = require('./rules/prefer-to-be-undefined');
const preferToHaveLength = require('./rules/prefer-to-have-length');
const validDescribe = require('./rules/valid-describe');
const validExpect = require('./rules/valid-expect');
const preferExpectAssertions = require('./rules/prefer-expect-assertions');
const validExpectInPromise = require('./rules/valid-expect-in-promise');

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
    'always-test-or-it': alwaysTestOrIt,
    'no-disabled-tests': noDisabledTests,
    'no-focused-tests': noFocusedTests,
    'no-identical-title': noIdenticalTitle,
    'no-large-snapshots': noLargeSnapshots,
    'prefer-to-be-null': preferToBeNull,
    'prefer-to-be-undefined': preferToBeUndefined,
    'prefer-to-have-length': preferToHaveLength,
    'valid-describe': validDescribe,
    'valid-expect': validExpect,
    'prefer-expect-assertions': preferExpectAssertions,
    'valid-expect-in-promise': validExpectInPromise,
  },
};
