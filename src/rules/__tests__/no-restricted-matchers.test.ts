import { TSESLint } from '@typescript-eslint/utils';
import rule from '../no-restricted-matchers';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('no-restricted-matchers', rule, {
  valid: [
    'expect(a).toHaveBeenCalled()',
    'expect(a).not.toHaveBeenCalled()',
    'expect(a).toHaveBeenCalledTimes()',
    'expect(a).toHaveBeenCalledWith()',
    'expect(a).toHaveBeenLastCalledWith()',
    'expect(a).toHaveBeenNthCalledWith()',
    'expect(a).toHaveReturned()',
    'expect(a).toHaveReturnedTimes()',
    'expect(a).toHaveReturnedWith()',
    'expect(a).toHaveLastReturnedWith()',
    'expect(a).toHaveNthReturnedWith()',
    'expect(a).toThrow()',
    'expect(a).rejects;',
    'expect(a);',
    {
      code: 'expect(a).resolves',
      options: [{ not: null }],
    },
    {
      code: 'expect(a).toBe(b)',
      options: [{ 'not.toBe': null }],
    },
    {
      code: 'expect(a)["toBe"](b)',
      options: [{ 'not.toBe': null }],
    },
  ],
  invalid: [
    {
      code: 'expect(a).toBe(b)',
      options: [{ toBe: null }],
      errors: [
        {
          messageId: 'restrictedChain',
          data: {
            message: null,
            chain: 'toBe',
          },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a)["toBe"](b)',
      options: [{ toBe: null }],
      errors: [
        {
          messageId: 'restrictedChain',
          data: {
            message: null,
            chain: 'toBe',
          },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a).not',
      options: [{ not: null }],
      errors: [
        {
          messageId: 'restrictedChain',
          data: {
            message: null,
            chain: 'not',
          },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a).not.toBe(b)',
      options: [{ not: null }],
      errors: [
        {
          messageId: 'restrictedChain',
          data: {
            message: null,
            chain: 'not',
          },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a).not.toBe(b)',
      options: [{ 'not.toBe': null }],
      errors: [
        {
          messageId: 'restrictedChain',
          data: {
            message: null,
            chain: 'not.toBe',
          },
          endColumn: 19,
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a).toBe(b)',
      options: [{ toBe: 'Prefer `toStrictEqual` instead' }],
      errors: [
        {
          messageId: 'restrictedChainWithMessage',
          data: {
            message: 'Prefer `toStrictEqual` instead',
            chain: 'toBe',
          },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: `
        test('some test', async () => {
          await expect(Promise.resolve(1)).resolves.toBe(1);
         });
      `,
      options: [{ resolves: 'Use `expect(await promise)` instead.' }],
      errors: [
        {
          messageId: 'restrictedChainWithMessage',
          data: {
            message: 'Use `expect(await promise)` instead.',
            chain: 'resolves',
          },
          endColumn: 52,
          column: 44,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).rejects.toBeFalsy()',
      options: [{ toBeFalsy: null }],
      errors: [
        {
          messageId: 'restrictedChain',
          data: {
            message: null,
            chain: 'toBeFalsy',
          },
          endColumn: 46,
          column: 37,
        },
      ],
    },
    {
      code: "expect(uploadFileMock).not.toHaveBeenCalledWith('file.name')",
      options: [
        { 'not.toHaveBeenCalledWith': 'Use not.toHaveBeenCalled instead' },
      ],
      errors: [
        {
          messageId: 'restrictedChainWithMessage',
          data: {
            message: 'Use not.toHaveBeenCalled instead',
            chain: 'not.toHaveBeenCalledWith',
          },
          endColumn: 48,
          column: 24,
        },
      ],
    },
  ],
});
