import dedent from 'dedent';
import rule from '../no-restricted-jest-methods';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('no-restricted-jest-methods', rule, {
  valid: [
    'jest',
    'jest()',
    'jest.mock()',
    'expect(a).rejects;',
    'expect(a);',
    {
      code: dedent`
        import { jest } from '@jest/globals';

        jest;
      `,
      parserOptions: { sourceType: 'module' },
    },
  ],
  invalid: [
    {
      code: 'jest.fn()',
      options: [{ fn: null }],
      errors: [
        {
          messageId: 'restrictedJestMethod',
          data: {
            message: null,
            restriction: 'fn',
          },
          column: 6,
          line: 1,
        },
      ],
    },
    {
      code: 'jest["fn"]()',
      options: [{ fn: null }],
      errors: [
        {
          messageId: 'restrictedJestMethod',
          data: {
            message: null,
            restriction: 'fn',
          },
          column: 6,
          line: 1,
        },
      ],
    },
    {
      code: 'jest.mock()',
      options: [{ mock: 'Do not use mocks' }],
      errors: [
        {
          messageId: 'restrictedJestMethodWithMessage',
          data: {
            message: 'Do not use mocks',
            restriction: 'mock',
          },
          column: 6,
          line: 1,
        },
      ],
    },
    {
      code: 'jest["mock"]()',
      options: [{ mock: 'Do not use mocks' }],
      errors: [
        {
          messageId: 'restrictedJestMethodWithMessage',
          data: {
            message: 'Do not use mocks',
            restriction: 'mock',
          },
          column: 6,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        import { jest } from '@jest/globals';

        jest.advanceTimersByTime();
      `,
      options: [{ advanceTimersByTime: null }],
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'restrictedJestMethod',
          data: {
            message: null,
            restriction: 'advanceTimersByTime',
          },
          column: 6,
          line: 3,
        },
      ],
    },
  ],
});
