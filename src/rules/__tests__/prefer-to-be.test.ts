import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../prefer-to-be';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('prefer-to-be', rule, {
  valid: [
    'expect(null).toBeNull();',
    'expect(null).not.toBeNull();',
    'expect(null).toBe(1);',
    'expect(obj).toStrictEqual([ x, 1 ]);',
    'expect(obj).toStrictEqual({ x: 1 });',
    'expect(obj).not.toStrictEqual({ x: 1 });',
    'expect(value).toMatchSnapshot();',
    "expect(catchError()).toStrictEqual({ message: 'oh noes!' })",
    'expect("something");',
  ],
  invalid: [
    {
      code: 'expect(value).toEqual("my string");',
      output: 'expect(value).toBe("my string");',
      errors: [{ messageId: 'useToBe', column: 15, line: 1 }],
    },
    {
      code: 'expect(value).toStrictEqual("my string");',
      output: 'expect(value).toBe("my string");',
      errors: [{ messageId: 'useToBe', column: 15, line: 1 }],
    },
    {
      code: 'expect(loadMessage()).resolves.toStrictEqual("hello world");',
      output: 'expect(loadMessage()).resolves.toBe("hello world");',
      errors: [{ messageId: 'useToBe', column: 32, line: 1 }],
    },
  ],
});

ruleTester.run('prefer-to-be: null', rule, {
  valid: [
    'expect(null).toBeNull();',
    'expect(null).not.toBeNull();',
    'expect(null).toBe(1);',
    'expect(obj).toStrictEqual([ x, 1 ]);',
    'expect(obj).toStrictEqual({ x: 1 });',
    'expect(obj).not.toStrictEqual({ x: 1 });',
    'expect(value).toMatchSnapshot();',
    "expect(catchError()).toStrictEqual({ message: 'oh noes!' })",
    'expect("something");',
    //
    'expect(null).not.toEqual();',
    'expect(null).toBe();',
    'expect(null).toMatchSnapshot();',
    'expect("a string").toMatchSnapshot(null);',
    'expect("a string").not.toMatchSnapshot();',
    'expect(null).toBe',
  ],
  invalid: [
    {
      code: 'expect(null).toBe(null);',
      output: 'expect(null).toBeNull();',
      errors: [{ messageId: 'useToBeNull', column: 14, line: 1 }],
    },
    {
      code: 'expect(null).toEqual(null);',
      output: 'expect(null).toBeNull();',
      errors: [{ messageId: 'useToBeNull', column: 14, line: 1 }],
    },
    {
      code: 'expect(null).toStrictEqual(null);',
      output: 'expect(null).toBeNull();',
      errors: [{ messageId: 'useToBeNull', column: 14, line: 1 }],
    },
    {
      code: 'expect("a string").not.toBe(null);',
      output: 'expect("a string").not.toBeNull();',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").not.toEqual(null);',
      output: 'expect("a string").not.toBeNull();',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").not.toStrictEqual(null);',
      output: 'expect("a string").not.toBeNull();',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
    },
  ],
});

ruleTester.run('prefer-to-be: undefined', rule, {
  valid: [
    'expect(undefined).toBeUndefined();',
    'expect(true).not.toBeUndefined();',
    'expect({}).toEqual({});',
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
      output: 'expect(undefined).toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 19, line: 1 }],
    },
    {
      code: 'expect(undefined).toEqual(undefined);',
      output: 'expect(undefined).toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 19, line: 1 }],
    },
    {
      code: 'expect(undefined).toStrictEqual(undefined);',
      output: 'expect(undefined).toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 19, line: 1 }],
    },
    {
      code: 'expect("a string").not.toBe(undefined);',
      output: 'expect("a string").not.toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").not.toEqual(undefined);',
      output: 'expect("a string").not.toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").not.toStrictEqual(undefined);',
      output: 'expect("a string").not.toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 24, line: 1 }],
    },
  ],
});

new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
}).run('prefer-to-be: typescript edition', rule, {
  valid: [
    "(expect('Model must be bound to an array if the multiple property is true') as any).toHaveBeenTipped()",
  ],
  invalid: [
    {
      code: 'expect(null).toEqual(1 as unknown as string as unknown as any);',
      output: 'expect(null).toBe(1 as unknown as string as unknown as any);',
      errors: [{ messageId: 'useToBe', column: 14, line: 1 }],
    },
    {
      code: 'expect("a string").not.toStrictEqual("string" as number);',
      output: 'expect("a string").not.toBe("string" as number);',
      errors: [{ messageId: 'useToBe', column: 24, line: 1 }],
    },
    {
      code: 'expect(null).toBe(null as unknown as string as unknown as any);',
      output: 'expect(null).toBeNull();',
      errors: [{ messageId: 'useToBeNull', column: 14, line: 1 }],
    },
    {
      code: 'expect("a string").not.toEqual(null as number);',
      output: 'expect("a string").not.toBeNull();',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
    },
    {
      code: 'expect(undefined).toBe(undefined as unknown as string as any);',
      output: 'expect(undefined).toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 19, line: 1 }],
    },
    {
      code: 'expect("a string").not.toEqual(undefined as number);',
      output: 'expect("a string").not.toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 24, line: 1 }],
    },
  ],
});
