import { TSESLint } from '@typescript-eslint/utils';
import rule from '../prefer-to-be';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

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
    'expect(token).toStrictEqual(/[abc]+/g);',
    "expect(token).toStrictEqual(new RegExp('[abc]+', 'g'));",
    'expect(value).toEqual(dedent`my string`);',
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
      code: 'expect(value).toStrictEqual(1);',
      output: 'expect(value).toBe(1);',
      errors: [{ messageId: 'useToBe', column: 15, line: 1 }],
    },
    {
      code: 'expect(value).toEqual(`my string`);',
      output: 'expect(value).toBe(`my string`);',
      errors: [{ messageId: 'useToBe', column: 15, line: 1 }],
    },
    {
      code: 'expect(value)["toEqual"](`my string`);',
      output: "expect(value)['toBe'](`my string`);",
      errors: [{ messageId: 'useToBe', column: 15, line: 1 }],
    },
    {
      code: 'expect(value).toStrictEqual(`my ${string}`);',
      output: 'expect(value).toBe(`my ${string}`);',
      errors: [{ messageId: 'useToBe', column: 15, line: 1 }],
    },
    {
      code: 'expect(loadMessage()).resolves.toStrictEqual("hello world");',
      output: 'expect(loadMessage()).resolves.toBe("hello world");',
      errors: [{ messageId: 'useToBe', column: 32, line: 1 }],
    },
    {
      code: 'expect(loadMessage()).resolves["toStrictEqual"]("hello world");',
      output: 'expect(loadMessage()).resolves[\'toBe\']("hello world");',
      errors: [{ messageId: 'useToBe', column: 32, line: 1 }],
    },
    {
      code: 'expect(loadMessage())["resolves"].toStrictEqual("hello world");',
      output: 'expect(loadMessage())["resolves"].toBe("hello world");',
      errors: [{ messageId: 'useToBe', column: 35, line: 1 }],
    },
    {
      code: 'expect(loadMessage()).resolves.toStrictEqual(false);',
      output: 'expect(loadMessage()).resolves.toBe(false);',
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
      code: 'expect("a string").not["toBe"](null);',
      output: 'expect("a string").not[\'toBeNull\']();',
      errors: [{ messageId: 'useToBeNull', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string")["not"]["toBe"](null);',
      output: 'expect("a string")["not"][\'toBeNull\']();',
      errors: [{ messageId: 'useToBeNull', column: 27, line: 1 }],
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
    'expect(true).toBeDefined();',
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
      output: 'expect("a string").toBeDefined();',
      errors: [{ messageId: 'useToBeDefined', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").rejects.not.toBe(undefined);',
      output: 'expect("a string").rejects.toBeDefined();',
      errors: [{ messageId: 'useToBeDefined', column: 32, line: 1 }],
    },
    {
      code: 'expect("a string").rejects.not["toBe"](undefined);',
      output: 'expect("a string").rejects[\'toBeDefined\']();',
      errors: [{ messageId: 'useToBeDefined', column: 32, line: 1 }],
    },
    {
      code: 'expect("a string").not.toEqual(undefined);',
      output: 'expect("a string").toBeDefined();',
      errors: [{ messageId: 'useToBeDefined', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").not.toStrictEqual(undefined);',
      output: 'expect("a string").toBeDefined();',
      errors: [{ messageId: 'useToBeDefined', column: 24, line: 1 }],
    },
  ],
});

ruleTester.run('prefer-to-be: NaN', rule, {
  valid: [
    'expect(NaN).toBeNaN();',
    'expect(true).not.toBeNaN();',
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
      code: 'expect(NaN).toBe(NaN);',
      output: 'expect(NaN).toBeNaN();',
      errors: [{ messageId: 'useToBeNaN', column: 13, line: 1 }],
    },
    {
      code: 'expect(NaN).toEqual(NaN);',
      output: 'expect(NaN).toBeNaN();',
      errors: [{ messageId: 'useToBeNaN', column: 13, line: 1 }],
    },
    {
      code: 'expect(NaN).toStrictEqual(NaN);',
      output: 'expect(NaN).toBeNaN();',
      errors: [{ messageId: 'useToBeNaN', column: 13, line: 1 }],
    },
    {
      code: 'expect("a string").not.toBe(NaN);',
      output: 'expect("a string").not.toBeNaN();',
      errors: [{ messageId: 'useToBeNaN', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").rejects.not.toBe(NaN);',
      output: 'expect("a string").rejects.not.toBeNaN();',
      errors: [{ messageId: 'useToBeNaN', column: 32, line: 1 }],
    },
    {
      code: 'expect("a string")["rejects"].not.toBe(NaN);',
      output: 'expect("a string")["rejects"].not.toBeNaN();',
      errors: [{ messageId: 'useToBeNaN', column: 35, line: 1 }],
    },
    {
      code: 'expect("a string").not.toEqual(NaN);',
      output: 'expect("a string").not.toBeNaN();',
      errors: [{ messageId: 'useToBeNaN', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").not.toStrictEqual(NaN);',
      output: 'expect("a string").not.toBeNaN();',
      errors: [{ messageId: 'useToBeNaN', column: 24, line: 1 }],
    },
  ],
});

ruleTester.run('prefer-to-be: undefined vs defined', rule, {
  valid: [
    'expect(NaN).toBeNaN();',
    'expect(true).not.toBeNaN();',
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
      code: 'expect(undefined).not.toBeDefined();',
      output: 'expect(undefined).toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 23, line: 1 }],
    },
    {
      code: 'expect(undefined).resolves.not.toBeDefined();',
      output: 'expect(undefined).resolves.toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 32, line: 1 }],
    },
    {
      code: 'expect(undefined).resolves.toBe(undefined);',
      output: 'expect(undefined).resolves.toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 28, line: 1 }],
    },
    {
      code: 'expect("a string").not.toBeUndefined();',
      output: 'expect("a string").toBeDefined();',
      errors: [{ messageId: 'useToBeDefined', column: 24, line: 1 }],
    },
    {
      code: 'expect("a string").rejects.not.toBeUndefined();',
      output: 'expect("a string").rejects.toBeDefined();',
      errors: [{ messageId: 'useToBeDefined', column: 32, line: 1 }],
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
      code: 'expect("a string").toEqual(undefined as number);',
      output: 'expect("a string").toBeUndefined();',
      errors: [{ messageId: 'useToBeUndefined', column: 20, line: 1 }],
    },
  ],
});
