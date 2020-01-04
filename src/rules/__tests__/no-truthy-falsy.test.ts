import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-truthy-falsy';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('no-truthy-falsy', rule, {
  valid: [
    'expect(true).toBe(true);',
    'expect(false).toBe(false);',
    'expect("anything").toBe(true);',
    'expect("anything").toEqual(false);',
    'expect("anything").not.toBe(true);',
    'expect("anything").not.toEqual(true);',
    'expect(Promise.resolve({})).resolves.toBe(true);',
    'expect(Promise.reject({})).rejects.toBe(true);',
    'expect(a);',
  ],

  invalid: [
    {
      code: 'expect(true).toBeTruthy();',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeTruthy' },
          column: 14,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(true)["toBeTruthy"]();',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeTruthy' },
          column: 14,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(false).not.toBeTruthy();',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeTruthy' },
          column: 19,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).resolves.toBeTruthy()',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeTruthy' },
          column: 38,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).rejects.toBeTruthy()',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeTruthy' },
          column: 37,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(false).toBeFalsy();',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeFalsy' },
          column: 15,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(true).not.toBeFalsy();',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeFalsy' },
          column: 18,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).resolves.toBeFalsy()',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeFalsy' },
          column: 38,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve({})).rejects.toBeFalsy()',
      errors: [
        {
          messageId: 'avoidMatcher',
          data: { matcherName: 'toBeFalsy' },
          column: 37,
          line: 1,
        },
      ],
    },
  ],
});
