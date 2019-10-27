import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../prefer-to-be-undefined';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('prefer-to-be-undefined', rule, {
  valid: [
    'expect(undefined).toBeUndefined();',
    'expect(true).not.toBeUndefined();',
    'expect({}).toEqual({});',
    'expect(null).toEqual(null);',
    'expect(something).toBe()',
    'expect(something).toBe(somethingElse)',
    'expect(something).toEqual(somethingElse)',
    'expect(something).not.toBe(somethingElse)',
    'expect(something).not.toEqual(somethingElse)',
    'expect(undefined).toBe',
    'expect("something");',
  ],

  invalid: [
    {
      code: 'expect(undefined).toBe(undefined);',
      errors: [{ messageId: 'useToBeUndefined', column: 19, line: 1 }],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect(undefined).toEqual(undefined);',
      errors: [{ messageId: 'useToBeUndefined', column: 19, line: 1 }],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect(undefined).toStrictEqual(undefined);',
      errors: [{ messageId: 'useToBeUndefined', column: 19, line: 1 }],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect("a string").not.toBe(undefined);',
      errors: [{ messageId: 'useToBeUndefined', column: 24, line: 1 }],
      output: 'expect("a string").not.toBeUndefined();',
    },
    {
      code: 'expect("a string").not.toEqual(undefined);',
      errors: [{ messageId: 'useToBeUndefined', column: 24, line: 1 }],
      output: 'expect("a string").not.toBeUndefined();',
    },
    {
      code: 'expect("a string").not.toStrictEqual(undefined);',
      errors: [{ messageId: 'useToBeUndefined', column: 24, line: 1 }],
      output: 'expect("a string").not.toBeUndefined();',
    },
  ],
});

new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
}).run('prefer-to-be-undefined: typescript edition', rule, {
  valid: [
    "(expect('Model must be bound to an array if the multiple property is true') as any).toHaveBeenTipped()",
  ],
  invalid: [
    {
      code: 'expect(undefined).toBe(undefined as unknown as string as any);',
      errors: [{ messageId: 'useToBeUndefined', column: 19, line: 1 }],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect("a string").not.toEqual(undefined as number);',
      errors: [{ messageId: 'useToBeUndefined', column: 24, line: 1 }],
      output: 'expect("a string").not.toBeUndefined();',
    },
  ],
});
