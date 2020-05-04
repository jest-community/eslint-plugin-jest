import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-expect-to-match-object';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('no-expect-to-match-object', rule, {
  valid: [
    'expect({ a: 1, b: 2 }).toStrictEqual({ a: 1, b: 2 });',
    'expect({ a: 1, b: 2 }).toStrictEqual(expect.objectContaining({ a: 1, b: expect.any(Number)}));',
    'expect(a);',
    'expect(a).not;',
    'expect({ a: 1, b: 2 }).not.toStrictEqual({ a: 1, b: 3 });',
    'toMatchObject({ a: 1, b: 2 });',
  ],
  invalid: [
    {
      code: 'expect({ a: 1, b: 2 }).toMatchObject({ a: 1, b: 2 });',
      errors: [
        {
          endColumn: 37,
          column: 24,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect({ a: 1, b: 2 }).not.toMatchObject({ a: 1, b: 2 });',
      errors: [
        {
          endColumn: 41,
          column: 28,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect({ a: 1, b: 2 }).toMatchObject;',
      errors: [
        {
          endColumn: 37,
          column: 24,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect({ a: 1, b: 2 }).not.toMatchObject;',
      errors: [
        {
          endColumn: 41,
          column: 28,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect({ a: 1, b: 2 }).toMatchObject();',
      errors: [
        {
          endColumn: 37,
          column: 24,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect({ a: 1, b: 2 }).not.toMatchObject();',
      errors: [
        {
          endColumn: 41,
          column: 28,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect({ a: 1, b: 2 }).toMatchObject({}, {});',
      errors: [
        {
          endColumn: 37,
          column: 24,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect({ a: 1, b: 2 }).not.toMatchObject({}, {});',
      errors: [
        {
          endColumn: 41,
          column: 28,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect().toMatchObject({ a: 1, b: 2 });',
      errors: [
        {
          endColumn: 23,
          column: 10,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect().not.toMatchObject({ a: 1, b: 2 });',
      errors: [
        {
          endColumn: 27,
          column: 14,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect("non-object").toMatchObject({ a: 1, b: 2 });',
      errors: [
        {
          endColumn: 35,
          column: 22,
          messageId: 'useToStrictEqual',
        },
      ],
    },
    {
      code: 'expect("non-object").not.toMatchObject({ a: 1, b: 2 });',
      errors: [
        {
          endColumn: 39,
          column: 26,
          messageId: 'useToStrictEqual',
        },
      ],
    },
  ],
});
