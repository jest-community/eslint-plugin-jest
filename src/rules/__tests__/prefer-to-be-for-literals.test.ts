import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../prefer-to-be-for-literals';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('prefer-to-be-for-literals', rule, {
  valid: [
    'expect(null).toBeNull();',
    'expect(null).not.toBeNull();',
    'expect(obj).toStrictEqual([ x, 1 ]);',
    'expect(obj).toStrictEqual({ x: 1 });',
    'expect(obj).not.toStrictEqual({ x: 1 });',
    'expect(value).toMatchSnapshot();',
    "expect(catchError()).toStrictEqual({ message: 'oh noes!' })",
    'expect("something");',
  ],
  invalid: [
    {
      code: 'expect(null).toEqual(null);',
      output: 'expect(null).toBe(null);',
      errors: [{ messageId: 'useToBe', column: 14, line: 1 }],
    },
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

new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
}).run('prefer-to-be-for-literals: typescript edition', rule, {
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
      code: 'expect("a string").not.toStrictEqual(null as number);',
      output: 'expect("a string").not.toBe(null as number);',
      errors: [{ messageId: 'useToBe', column: 24, line: 1 }],
    },
  ],
});
