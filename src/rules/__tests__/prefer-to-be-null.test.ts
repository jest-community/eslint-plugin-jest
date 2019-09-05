import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../prefer-to-be-null';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('prefer-to-be-null', rule, {
  valid: [
    'expect(null).toBeNull();',
    'expect(null).toEqual();',
    'expect(null).not.toBeNull();',
    'expect(null).not.toEqual();',
    'expect(null).toBe(undefined);',
    'expect(null).not.toBe(undefined);',
    'expect(null).toBe();',
    'expect(null).toMatchSnapshot();',
    'expect("a string").toMatchSnapshot(null);',
    'expect("a string").not.toMatchSnapshot();',
    "expect(something).toEqual('a string');",
    'expect(null).toBe',
    'expect("something");',
  ],

  invalid: [
    {
      code: 'expect(null).toBe(null);',
      errors: [{ messageId: 'useToBeNull', column: 14, line: 1 }],
      output: 'expect(null).toBeNull();',
    },
    {
      code: 'expect(null).toEqual(null);',
      errors: [{ messageId: 'useToBeNull', column: 14, line: 1 }],
      output: 'expect(null).toBeNull();',
    },
    {
      code: 'expect(null).toStrictEqual(null);',
      errors: [{ messageId: 'useToBeNull', column: 14, line: 1 }],
      output: 'expect(null).toBeNull();',
    },
    {
      code: 'expect("a string").not.toBe(null);',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
      output: 'expect("a string").not.toBeNull();',
    },
    {
      code: 'expect("a string").not.toEqual(null);',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
      output: 'expect("a string").not.toBeNull();',
    },
    {
      code: 'expect("a string").not.toStrictEqual(null);',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
      output: 'expect("a string").not.toBeNull();',
    },
  ],
});

new TSESLint.RuleTester({
  parser: '@typescript-eslint/parser',
}).run('prefer-to-be-null: typescript edition', rule, {
  valid: [
    "(expect('Model must be bound to an array if the multiple property is true') as any).toHaveBeenTipped()",
  ],
  invalid: [
    {
      code: 'expect(null).toBe(null as unknown as string as unknown as any);',
      errors: [{ messageId: 'useToBeNull', column: 14, line: 1 }],
      output: 'expect(null).toBeNull();',
    },
    {
      code: 'expect("a string").not.toEqual(null as number);',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
      output: 'expect("a string").not.toBeNull();',
    },
  ],
});
