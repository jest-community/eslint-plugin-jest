import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-unnecessary-functions';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('no-unnecessary-functions', rule, {
  valid: [
    {
      code:
        'beforeEach(() => { jest.resetModules(); jest.clearAllMocks(); jest.resetAllMocks(); jest.restoreAllMocks(); })',
      options: [{ reportFunctionNames: [] }],
    },
    {
      code:
        'beforeEach(() => { jest.resetModules(); jest.clearAllMocks(); jest.resetAllMocks(); jest.restoreAllMocks(); })',
    },
    {
      code:
        'beforeEach(() => { jest.clearAllMocks(); jest.resetAllMocks(); jest.restoreAllMocks(); })',
      options: [{ reportFunctionNames: ['resetModules'] }],
    },
    {
      code:
        'beforeEach(() => { jest.resetModules(); jest.resetAllMocks(); jest.restoreAllMocks(); })',
      options: [{ reportFunctionNames: ['clearAllMocks'] }],
    },
    {
      code:
        'beforeEach(() => { jest.resetModules(); jest.clearAllMocks(); jest.restoreAllMocks(); })',
      options: [{ reportFunctionNames: ['resetAllMocks'] }],
    },
    {
      code:
        'beforeEach(() => { jest.resetModules(); jest.clearAllMocks(); jest.resetAllMocks(); })',
      options: [{ reportFunctionNames: ['restoreAllMocks'] }],
    },
    {
      code: 'beforeEach(() => {})',
      options: [
        {
          reportFunctionNames: [
            'resetModules',
            'clearAllMocks',
            'resetAllMocks',
            'restoreAllMocks',
          ],
        },
      ],
    },
  ],
  invalid: [
    {
      code: 'beforeEach(() => { jest.resetModules(); })',
      options: [{ reportFunctionNames: ['resetModules'] }],
      errors: [
        { endColumn: 39, column: 20, messageId: 'noUnnecassaryFunction' },
      ],
    },
    {
      code: 'beforeEach(() => { jest.clearAllMocks(); })',
      options: [{ reportFunctionNames: ['clearAllMocks'] }],
      errors: [
        { endColumn: 40, column: 20, messageId: 'noUnnecassaryFunction' },
      ],
    },
    {
      code: 'beforeEach(() => { jest.resetAllMocks(); })',
      options: [{ reportFunctionNames: ['resetAllMocks'] }],
      errors: [
        { endColumn: 40, column: 20, messageId: 'noUnnecassaryFunction' },
      ],
    },
    {
      code: 'beforeEach(() => { jest.restoreAllMocks(); })',
      options: [{ reportFunctionNames: ['restoreAllMocks'] }],
      errors: [
        { endColumn: 42, column: 20, messageId: 'noUnnecassaryFunction' },
      ],
    },
    {
      code:
        'beforeEach(() => { jest.resetModules(); jest.clearAllMocks(); jest.resetAllMocks(); jest.restoreAllMocks(); })',
      options: [
        {
          reportFunctionNames: [
            'resetModules',
            'clearAllMocks',
            'resetAllMocks',
            'restoreAllMocks',
          ],
        },
      ],
      errors: [
        { endColumn: 39, column: 20, messageId: 'noUnnecassaryFunction' },
        { endColumn: 61, column: 41, messageId: 'noUnnecassaryFunction' },
        { endColumn: 83, column: 63, messageId: 'noUnnecassaryFunction' },
        { endColumn: 107, column: 85, messageId: 'noUnnecassaryFunction' },
      ],
    },
  ],
});
