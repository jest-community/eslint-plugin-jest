import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-expect-to-match-object';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('no-expect-to-match-object', rule, {
  valid: [
    'expect({ a: 1, b: 2 }).toStrictEqual({ a: 1, b: 2 });',
    'expect({ a: 1, b: 2 }).objectContaining({ a: expect.any(Number), b: expect.any(Number) });',
  ],
  invalid: [
    {
      code: 'expect({ a: 1, b: 2 }).toMatchObject({ a: 1, b: 2 });',
      errors: [
        {
          endColumn: 37,
          column: 24,
          messageId: 'useToStrictEqualOrObjectContaining',
        },
      ],
    },
  ],
});
