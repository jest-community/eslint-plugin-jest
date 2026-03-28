import path from 'path';
import * as tsParser from '@typescript-eslint/parser';
import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../valid-expect';
import {
  FlatCompatRuleTester as RuleTester,
  createRuleRequirerTester,
  espreeParser,
  getFixturesRootDir,
  usingFlatConfig,
} from './test-utils';

const rootPath = getFixturesRootDir();
const fixtureFilename = path.join(rootPath, 'file.ts');

const { TSESLintPluginRef, requireRule, withFixtureFilename } =
  createRuleRequirerTester<readonly unknown[], string>(
    '../valid-expect',
    'typescript',
    fixtureFilename,
  );

describe('typecheck option availability', () => {
  const parser = '@typescript-eslint/parser';

  const createLinter = () => {
    const linter = new TSESLint.Linter();

    if (!usingFlatConfig) {
      linter.defineParser(parser, tsParser);
      linter.defineRule('valid-expect', requireRule(false));
    }

    return linter;
  };

  afterEach(() => {
    TSESLintPluginRef.throwWhenRequiring = false;
  });

  it('does not require typescript when the rule is imported', () => {
    expect(() => requireRule(true)).not.toThrow();
  });

  describe('when typecheck is disabled', () => {
    it('does not require typechecking', () => {
      const linter = createLinter();

      expect(() => {
        /* istanbul ignore if */
        if (usingFlatConfig) {
          linter.verify('expect(() => {}).toThrow()', [
            {
              plugins: { jest: { rules: { 'valid-expect': rule } } },
              languageOptions: {
                parser: tsParser,
                parserOptions: { sourceType: 'module' },
              },
              rules: { 'jest/valid-expect': ['error', { typecheck: false }] },
            },
          ]);

          return;
        }

        linter.verify('expect(() => {}).toThrow()', {
          parser,
          parserOptions: { sourceType: 'module' },
          rules: { 'valid-expect': ['error', { typecheck: false }] },
        });
      }).not.toThrow();
    });

    it('does not require typescript', () => {
      const linter = createLinter();

      TSESLintPluginRef.throwWhenRequiring = true;

      expect(() => {
        /* istanbul ignore if */
        if (usingFlatConfig) {
          linter.verify('expect(() => {}).toThrow()', [
            {
              plugins: { jest: { rules: { 'valid-expect': rule } } },
              languageOptions: {
                parser: tsParser,
                parserOptions: {
                  sourceType: 'module',
                  tsconfigRootDir: rootPath,
                  project: './tsconfig.json',
                  disallowAutomaticSingleRunInference: true,
                },
              },
              rules: { 'jest/valid-expect': ['error', { typecheck: false }] },
            },
          ]);

          return;
        }

        linter.verify('expect(() => {}).toThrow()', {
          parser,
          parserOptions: {
            sourceType: 'module',
            tsconfigRootDir: rootPath,
            project: './tsconfig.json',
            disallowAutomaticSingleRunInference: true,
          },
          rules: { 'valid-expect': ['error', { typecheck: false }] },
        });
      }).not.toThrow();
    });
  });

  describe('when typecheck is enabled', () => {
    it('requires typechecking', () => {
      const linter = createLinter();

      expect(() => {
        /* istanbul ignore if */
        if (usingFlatConfig) {
          linter.verify('expect(() => {}).toThrow()', [
            {
              plugins: { jest: { rules: { 'valid-expect': rule } } },
              languageOptions: {
                parser: tsParser,
                parserOptions: { sourceType: 'module' },
              },
              rules: { 'jest/valid-expect': ['error', { typecheck: true }] },
            },
          ]);

          return;
        }

        linter.verify('expect(() => {}).toThrow()', {
          parser,
          parserOptions: { sourceType: 'module' },
          rules: { 'valid-expect': ['error', { typecheck: true }] },
        });
      }).toThrow(/requires type information|parserOptions/iu);
    });
  });
});

new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
    disallowAutomaticSingleRunInference: true,
  },
}).run('valid-expect (typecheck option)', requireRule(false), {
  valid: withFixtureFilename([
    {
      code: 'expect(() => {}).toThrow()',
      options: [{ typecheck: true }],
    },
    {
      code: 'expect(function () {}).toThrow()',
      options: [{ typecheck: true }],
    },
    {
      code: 'expect(1 as () => void).toThrow();',
      options: [{ typecheck: true }],
    },
    {
      code: 'expect(1 as unknown as () => void).toThrow();',
      options: [{ typecheck: true }],
    },
    {
      code: 'expect(1 as any as () => void).toThrow();',
      options: [{ typecheck: true }],
    },
    {
      code: 'expect(1 as unknown & (() => void)).toThrow()',
      options: [{ typecheck: true }],
    },

    {
      code: dedent`
        function mx() { return 1; }

        expect(mx()).toBe(1);
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        function mx() { return 1; }

        expect(() => mx()).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        function mx() { return 1; }

        expect(mx).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        function mx() { return 1; }

        expect(mx).toThrowError();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        function mx() { return () => {}; }

        expect(mx()).toThrow();
      `,
      options: [{ typecheck: true }],
    },

    {
      code: dedent`
        const mx = () => { return 1; };

        expect(mx()).toBe(1);
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => { return 1; };

        expect(() => mx()).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => { return 1; };

        expect(mx).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => { return 1; };

        expect(mx).toThrowErrorMatchingSnapshot();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => { return () => {} };

        expect(mx()).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => { return () => {} };

        expect(() => { mx() }).toThrow();
      `,
      options: [{ typecheck: true }],
    },

    {
      code: dedent`
        const mx = () => 1;

        expect(mx()).toBe(1);
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => "hello world";

        expect(() => mx()).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => 5;

        expect(mx).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = function () { return 1; };

        expect(mx).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => 5;

        expect(mx).toThrowErrorMatchingInlineSnapshot();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => () => {};

        expect(mx()).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => () => {};

        expect(() => { mx() }).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        const mx = () => () => {};

        expect(function() { mx() }).toThrow();
      `,
      options: [{ typecheck: true }],
    },

    {
      code: dedent`
        class Mx { sayHello() {} }

        expect(new Mx().sayHello).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        class Mx { sayHello() { return () => {} } }

        expect(new Mx().sayHello).toThrow();
      `,
      options: [{ typecheck: true }],
    },
    {
      code: dedent`
        class Mx { sayHello() { return () => {} } }

        expect(new Mx().sayHello, 123).toThrow();
      `,
      options: [{ typecheck: true, maxArgs: 2 }],
    },
  ]),
  invalid: withFixtureFilename([
    {
      code: 'expect(1).toThrow()',
      options: [{ typecheck: true }],
      output: 'expect(() => 1).toThrow()',
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1, 123).toThrow()',
      options: [{ typecheck: true, maxArgs: 2 }],
      output: 'expect(() => 1, 123).toThrow()',
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1 as unknown).toThrow()',
      options: [{ typecheck: true }],
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1 as any).toThrow()',
      options: [{ typecheck: true }],
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1 as any | (() => void)).toThrow()',
      options: [{ typecheck: true }],
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1 as any | string).toThrow()',
      options: [{ typecheck: true }],
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1 as string | (() => void)).toThrow()',
      options: [{ typecheck: true }],
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1 as (() => void) | string).toThrow()',
      options: [{ typecheck: true }],
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1).toThrowError()',
      options: [{ typecheck: true }],
      output: 'expect(() => 1).toThrowError()',
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrowError' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1).toThrowErrorMatchingSnapshot()',
      options: [{ typecheck: true }],
      output: 'expect(() => 1).toThrowErrorMatchingSnapshot()',
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrowErrorMatchingSnapshot' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1).toThrowErrorMatchingInlineSnapshot()',
      options: [{ typecheck: true }],
      output: 'expect(() => 1).toThrowErrorMatchingInlineSnapshot()',
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrowErrorMatchingInlineSnapshot' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect("hello world").toThrow()',
      options: [{ typecheck: true }],
      output: 'expect(() => "hello world").toThrow()',
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(function () { return "hello world" }()).toThrow()',
      options: [{ typecheck: true }],
      output: 'expect(() => function () { return "hello world" }()).toThrow()',
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(function () { return "hello world" }()).toThrowError()',
      options: [{ typecheck: true }],
      output:
        'expect(() => function () { return "hello world" }()).toThrowError()',
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrowError' },
          column: 8,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        const mx = function () {
          return Math.random() > 0.5 ? () => {} : null;
        };

        expect(mx()).toThrow();
      `,
      options: [{ typecheck: true }],
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 5,
        },
      ],
    },
    {
      code: dedent`
        const mx = () => () => {};

        expect(mx()()).toThrow();
      `,
      options: [{ typecheck: true }],
      output: dedent`
        const mx = () => () => {};

        expect(() => mx()()).toThrow();
      `,
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        class Mx { sayHello() {} }

        expect(new Mx().sayHello()).toThrow();
      `,
      options: [{ typecheck: true }],
      output: dedent`
        class Mx { sayHello() {} }

        expect(() => new Mx().sayHello()).toThrow();
      `,
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        class Mx { sayHello() { return () => {} } }

        expect(new Mx().sayHello()()).toThrow();
      `,
      options: [{ typecheck: true }],
      output: dedent`
        class Mx { sayHello() { return () => {} } }

        expect(() => new Mx().sayHello()()).toThrow();
      `,
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrow' },
          column: 8,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        class Mx { sayHello() { return () => {} } }

        expect(new Mx().sayHello()()).toThrowErrorMatchingInlineSnapshot();
      `,
      options: [{ typecheck: true }],
      output: dedent`
        class Mx { sayHello() { return () => {} } }

        expect(() => new Mx().sayHello()()).toThrowErrorMatchingInlineSnapshot();
      `,
      errors: [
        {
          messageId: 'toThrowWithoutCallable',
          data: { matcher: 'toThrowErrorMatchingInlineSnapshot' },
          column: 8,
          line: 3,
        },
      ],
    },
  ]),
});

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('valid-expect', rule, {
  valid: [
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect("something").toEqual("else");',
    'expect(true).toBeDefined();',
    'expect([1, 2, 3]).toEqual([1, 2, 3]);',
    'expect(undefined).not.toBeDefined();',
    'test("valid-expect", () => { return expect(Promise.resolve(2)).resolves.toBeDefined(); });',
    'test("valid-expect", () => { return expect(Promise.reject(2)).rejects.toBeDefined(); });',
    'test("valid-expect", () => { return expect(Promise.resolve(2)).resolves.not.toBeDefined(); });',
    'test("valid-expect", () => { return expect(Promise.resolve(2)).rejects.not.toBeDefined(); });',
    'test("valid-expect", function () { return expect(Promise.resolve(2)).resolves.not.toBeDefined(); });',
    'test("valid-expect", function () { return expect(Promise.resolve(2)).rejects.not.toBeDefined(); });',
    'test("valid-expect", function () { return Promise.resolve(expect(Promise.resolve(2)).resolves.not.toBeDefined()); });',
    'test("valid-expect", function () { return Promise.resolve(expect(Promise.resolve(2)).rejects.not.toBeDefined()); });',
    {
      code: 'test("valid-expect", () => expect(Promise.resolve(2)).resolves.toBeDefined());',
      options: [{ alwaysAwait: true }],
    },
    'test("valid-expect", () => expect(Promise.resolve(2)).resolves.toBeDefined());',
    'test("valid-expect", () => expect(Promise.reject(2)).rejects.toBeDefined());',
    'test("valid-expect", () => expect(Promise.reject(2)).resolves.not.toBeDefined());',
    'test("valid-expect", () => expect(Promise.reject(2)).rejects.not.toBeDefined());',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).resolves.not.toBeDefined(); });',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).rejects.not.toBeDefined(); });',
    'test("valid-expect", async function () { await expect(Promise.reject(2)).resolves.not.toBeDefined(); });',
    'test("valid-expect", async function () { await expect(Promise.reject(2)).rejects.not.toBeDefined(); });',
    'test("valid-expect", async () => { await Promise.resolve(expect(Promise.reject(2)).rejects.not.toBeDefined()); });',
    'test("valid-expect", async () => { await Promise.reject(expect(Promise.reject(2)).rejects.not.toBeDefined()); });',
    'test("valid-expect", async () => { await Promise.all([expect(Promise.reject(2)).rejects.not.toBeDefined(), expect(Promise.reject(2)).rejects.not.toBeDefined()]); });',
    'test("valid-expect", async () => { await Promise.race([expect(Promise.reject(2)).rejects.not.toBeDefined(), expect(Promise.reject(2)).rejects.not.toBeDefined()]); });',
    'test("valid-expect", async () => { await Promise.allSettled([expect(Promise.reject(2)).rejects.not.toBeDefined(), expect(Promise.reject(2)).rejects.not.toBeDefined()]); });',
    'test("valid-expect", async () => { await Promise.any([expect(Promise.reject(2)).rejects.not.toBeDefined(), expect(Promise.reject(2)).rejects.not.toBeDefined()]); });',
    'test("valid-expect", async () => { return expect(Promise.reject(2)).resolves.not.toBeDefined().then(() => console.log("valid-case")); });',
    'test("valid-expect", async () => { return expect(Promise.reject(2)).resolves.not.toBeDefined().then(() => console.log("valid-case")).then(() => console.log("another valid case")); });',
    'test("valid-expect", async () => { return expect(Promise.reject(2)).resolves.not.toBeDefined().catch(() => console.log("valid-case")); });',
    'test("valid-expect", async () => { return expect(Promise.reject(2)).resolves.not.toBeDefined().then(() => console.log("valid-case")).catch(() => console.log("another valid case")); });',
    'test("valid-expect", async () => { return expect(Promise.reject(2)).resolves.not.toBeDefined().then(() => { expect(someMock).toHaveBeenCalledTimes(1); }); });',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).resolves.not.toBeDefined().then(() => console.log("valid-case")); });',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).resolves.not.toBeDefined().then(() => console.log("valid-case")).then(() => console.log("another valid case")); });',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).resolves.not.toBeDefined().catch(() => console.log("valid-case")); });',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).resolves.not.toBeDefined().then(() => console.log("valid-case")).catch(() => console.log("another valid case")); });',
    'test("valid-expect", async () => { await expect(Promise.reject(2)).resolves.not.toBeDefined().then(() => { expect(someMock).toHaveBeenCalledTimes(1); }); });',
    dedent`
      test("valid-expect", () => {
        return expect(functionReturningAPromise()).resolves.toEqual(1).then(() => {
          return expect(Promise.resolve(2)).resolves.toBe(1);
        });
      });
    `,
    dedent`
      test("valid-expect", () => {
        return expect(functionReturningAPromise()).resolves.toEqual(1).then(async () => {
          await expect(Promise.resolve(2)).resolves.toBe(1);
        });
      });
    `,
    dedent`
      test("valid-expect", () => {
        return expect(functionReturningAPromise()).resolves.toEqual(1).then(() => expect(Promise.resolve(2)).resolves.toBe(1));
      });
    `,
    dedent`
      expect.extend({
        toResolve(obj) {
          return this.isNot
            ? expect(obj).toBe(true)
            : expect(obj).resolves.not.toThrow();
        }
      });
    `,
    dedent`
      expect.extend({
        toResolve(obj) {
          return this.isNot
            ? expect(obj).resolves.not.toThrow()
            : expect(obj).toBe(true);
        }
      });
    `,
    dedent`
      expect.extend({
        toResolve(obj) {
          return this.isNot
            ? expect(obj).toBe(true)
            : anotherCondition
            ? expect(obj).resolves.not.toThrow()
            : expect(obj).toBe(false)
        }
      });
    `,
    {
      code: 'expect(1).toBe(2);',
      options: [{ maxArgs: 2 }],
    },
    {
      code: 'expect(1, "1 !== 2").toBe(2);',
      options: [{ maxArgs: 2 }],
    },
    {
      code: 'expect(1, "1 !== 2").toBe(2);',
      options: [{ maxArgs: 2, minArgs: 2 }],
    },
    {
      code: 'test("valid-expect", () => { expect(2).not.toBe(2); });',
      options: [{ asyncMatchers: ['toRejectWith'] }],
    },
    {
      code: 'test("valid-expect", () => { expect(Promise.reject(2)).toRejectWith(2); });',
      options: [{ asyncMatchers: ['toResolveWith'] }],
    },
    {
      code: 'test("valid-expect", async () => { await expect(Promise.resolve(2)).toResolve(); });',
      options: [{ asyncMatchers: ['toResolveWith'] }],
    },
    {
      code: 'test("valid-expect", async () => { expect(Promise.resolve(2)).toResolve(); });',
      options: [{ asyncMatchers: ['toResolveWith'] }],
    },
    {
      code: 'expect().pass();',
      options: [{ minArgs: 0 }],
    },
  ],
  invalid: [
    {
      code: 'expect().toBe(2);',
      options: [{ minArgs: undefined, maxArgs: undefined }],
      errors: [
        {
          messageId: 'notEnoughArgs',
          data: {
            s: '',
            amount: 1,
          },
        },
      ],
    },
    {
      code: 'expect().toBe(true);',
      errors: [
        {
          endColumn: 8,
          column: 7,
          messageId: 'notEnoughArgs',
          data: {
            s: '',
            amount: 1,
          },
        },
      ],
    },
    {
      code: 'expect().toEqual("something");',
      errors: [
        {
          endColumn: 8,
          column: 7,
          messageId: 'notEnoughArgs',
          data: {
            s: '',
            amount: 1,
          },
        },
      ],
    },
    {
      code: 'expect("something", "else").toEqual("something");',
      errors: [
        {
          endColumn: 26,
          column: 21,
          messageId: 'tooManyArgs',
          data: {
            s: '',
            amount: 1,
          },
        },
      ],
    },
    {
      code: 'expect("something", "else", "entirely").toEqual("something");',
      options: [{ maxArgs: 2 }],
      errors: [
        {
          endColumn: 38,
          column: 29,
          messageId: 'tooManyArgs',
          data: {
            s: 's',
            amount: 2,
          },
        },
      ],
    },
    {
      code: 'expect("something", "else", "entirely").toEqual("something");',
      options: [{ maxArgs: 2, minArgs: 2 }],
      errors: [
        {
          endColumn: 38,
          column: 29,
          messageId: 'tooManyArgs',
          data: {
            s: 's',
            amount: 2,
          },
        },
      ],
    },
    {
      code: 'expect("something", "else", "entirely").toEqual("something");',
      options: [{ maxArgs: 2, minArgs: 1 }],
      errors: [
        {
          endColumn: 38,
          column: 29,
          messageId: 'tooManyArgs',
          data: {
            s: 's',
            amount: 2,
          },
        },
      ],
    },
    {
      code: 'expect("something").toEqual("something");',
      options: [{ minArgs: 2 }],
      errors: [
        {
          endColumn: 8,
          column: 7,
          messageId: 'notEnoughArgs',
          data: {
            s: 's',
            amount: 2,
          },
        },
      ],
    },
    {
      code: 'expect("something", "else").toEqual("something");',
      options: [{ maxArgs: 1, minArgs: 3 }],
      errors: [
        {
          endColumn: 8,
          column: 7,
          messageId: 'notEnoughArgs',
          data: {
            s: 's',
            amount: 3,
          },
        },
        {
          endColumn: 26,
          column: 21,
          messageId: 'tooManyArgs',
          data: {
            s: '',
            amount: 1,
          },
        },
      ],
    },
    {
      code: 'expect("something");',
      errors: [{ endColumn: 20, column: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect();',
      errors: [{ endColumn: 9, column: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect(true).toBeDefined;',
      errors: [
        {
          endColumn: 25,
          column: 14,
          messageId: 'matcherNotCalled',
        },
      ],
    },
    {
      code: 'expect(true).not.toBeDefined;',
      errors: [
        {
          endColumn: 29,
          column: 18,
          messageId: 'matcherNotCalled',
        },
      ],
    },
    {
      code: 'expect(true).nope.toBeDefined;',
      errors: [
        {
          endColumn: 30,
          column: 19,
          messageId: 'matcherNotCalled',
        },
      ],
    },
    {
      code: 'expect(true).nope.toBeDefined();',
      errors: [
        {
          endColumn: 32,
          column: 1,
          messageId: 'modifierUnknown',
        },
      ],
    },
    {
      code: 'expect(true).not.resolves.toBeDefined();',
      errors: [
        {
          endColumn: 40,
          column: 1,
          messageId: 'modifierUnknown',
        },
      ],
    },
    {
      code: 'expect(true).not.not.toBeDefined();',
      errors: [
        {
          endColumn: 35,
          column: 1,
          messageId: 'modifierUnknown',
        },
      ],
    },
    {
      code: 'expect(true).resolves.not.exactly.toBeDefined();',
      errors: [
        {
          endColumn: 48,
          column: 1,
          messageId: 'modifierUnknown',
        },
      ],
    },
    {
      code: 'expect(true).resolves;',
      errors: [
        {
          endColumn: 22,
          column: 14,
          messageId: 'matcherNotFound',
        },
      ],
    },
    {
      code: 'expect(true).rejects;',
      errors: [
        {
          endColumn: 21,
          column: 14,
          messageId: 'matcherNotFound',
        },
      ],
    },
    {
      code: 'expect(true).not;',
      errors: [
        {
          endColumn: 17,
          column: 14,
          messageId: 'matcherNotFound',
        },
      ],
    },
    /**
     * .resolves & .rejects checks
     */
    // Inline usages
    {
      code: 'expect(Promise.resolve(2)).resolves.toBeDefined();',
      errors: [
        {
          column: 1,
          endColumn: 50,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: 'expect(Promise.resolve(2)).rejects.toBeDefined();',
      errors: [
        {
          column: 1,
          endColumn: 49,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    // alwaysAwait option changes error message
    {
      code: 'expect(Promise.resolve(2)).resolves.toBeDefined();',
      options: [{ alwaysAwait: true }],
      errors: [
        {
          column: 1,
          endColumn: 50,
          messageId: 'asyncMustBeAwaited',
        },
      ],
    },
    {
      code: dedent`
        expect.extend({
          toResolve(obj) {
            this.isNot
              ? expect(obj).toBe(true)
              : expect(obj).resolves.not.toThrow();
          }
        });
      `,
      output: dedent`
        expect.extend({
          async toResolve(obj) {
            this.isNot
              ? expect(obj).toBe(true)
              : await expect(obj).resolves.not.toThrow();
          }
        });
      `,
      errors: [
        {
          column: 9,
          endColumn: 43,
          messageId: 'asyncMustBeAwaited',
        },
      ],
    },
    {
      code: dedent`
        expect.extend({
          toResolve(obj) {
            this.isNot
              ? expect(obj).resolves.not.toThrow()
              : expect(obj).toBe(true);
          }
        });
      `,
      output: dedent`
        expect.extend({
          async toResolve(obj) {
            this.isNot
              ? await expect(obj).resolves.not.toThrow()
              : expect(obj).toBe(true);
          }
        });
      `,
      errors: [
        {
          column: 9,
          endColumn: 43,
          messageId: 'asyncMustBeAwaited',
        },
      ],
    },
    {
      code: dedent`
        expect.extend({
          toResolve(obj) {
            this.isNot
              ? expect(obj).toBe(true)
              : anotherCondition
              ? expect(obj).resolves.not.toThrow()
              : expect(obj).toBe(false)
          }
        });
      `,
      output: dedent`
        expect.extend({
          async toResolve(obj) {
            this.isNot
              ? expect(obj).toBe(true)
              : anotherCondition
              ? await expect(obj).resolves.not.toThrow()
              : expect(obj).toBe(false)
          }
        });
      `,
      errors: [
        {
          column: 9,
          endColumn: 43,
          messageId: 'asyncMustBeAwaited',
        },
      ],
    },

    // expect().resolves
    {
      code: 'test("valid-expect", () => { expect(Promise.resolve(2)).resolves.toBeDefined(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).resolves.toBeDefined(); });',
      errors: [
        {
          column: 30,
          endColumn: 79,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: 'test("valid-expect", () => { expect(Promise.resolve(2)).toResolve(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).toResolve(); });',
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 30,
          line: 1,
        },
      ],
    },
    {
      code: 'test("valid-expect", () => { expect(Promise.resolve(2)).toResolve(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).toResolve(); });',
      options: [{ asyncMatchers: undefined }],
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 30,
          line: 1,
        },
      ],
    },
    {
      code: 'test("valid-expect", () => { expect(Promise.resolve(2)).toReject(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).toReject(); });',
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 30,
          line: 1,
        },
      ],
    },
    {
      code: 'test("valid-expect", () => { expect(Promise.resolve(2)).not.toReject(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).not.toReject(); });',
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 30,
          line: 1,
        },
      ],
    },
    // expect().resolves.not
    {
      code: 'test("valid-expect", () => { expect(Promise.resolve(2)).resolves.not.toBeDefined(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).resolves.not.toBeDefined(); });',
      errors: [
        {
          column: 30,
          endColumn: 83,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    // expect().rejects
    {
      code: 'test("valid-expect", () => { expect(Promise.resolve(2)).rejects.toBeDefined(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).rejects.toBeDefined(); });',
      errors: [
        {
          column: 30,
          endColumn: 78,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    // expect().rejects.not
    {
      code: 'test("valid-expect", () => { expect(Promise.resolve(2)).rejects.not.toBeDefined(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).rejects.not.toBeDefined(); });',
      errors: [
        {
          column: 30,
          endColumn: 82,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    // usages in async function
    {
      code: 'test("valid-expect", async () => { expect(Promise.resolve(2)).resolves.toBeDefined(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).resolves.toBeDefined(); });',
      errors: [
        {
          column: 36,
          endColumn: 85,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: 'test("valid-expect", async () => { expect(Promise.resolve(2)).resolves.not.toBeDefined(); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.resolve(2)).resolves.not.toBeDefined(); });',
      errors: [
        {
          column: 36,
          endColumn: 89,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: 'test("valid-expect", () => { expect(Promise.reject(2)).toRejectWith(2); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.reject(2)).toRejectWith(2); });',
      options: [{ asyncMatchers: ['toRejectWith'] }],
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 30,
        },
      ],
    },
    {
      code: 'test("valid-expect", () => { expect(Promise.reject(2)).rejects.toBe(2); });',
      output:
        'test("valid-expect", async () => { await expect(Promise.reject(2)).rejects.toBe(2); });',
      options: [{ asyncMatchers: ['toRejectWith'] }],
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 30,
        },
      ],
    },
    // alwaysAwait:false, one not awaited
    {
      code: dedent`
        test("valid-expect", async () => {
          expect(Promise.resolve(2)).resolves.not.toBeDefined();
          expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).resolves.not.toBeDefined();
          await expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      errors: [
        {
          line: 2,
          column: 3,
          endColumn: 56,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
        {
          line: 3,
          column: 3,
          endColumn: 51,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    // alwaysAwait: true, one returned
    {
      code: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).resolves.not.toBeDefined();
          expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).resolves.not.toBeDefined();
          await expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      errors: [
        {
          line: 3,
          column: 3,
          endColumn: 51,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    /**
     * Multiple async assertions
     */
    // both not awaited
    {
      code: dedent`
        test("valid-expect", async () => {
          expect(Promise.resolve(2)).resolves.not.toBeDefined();
          return expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).resolves.not.toBeDefined();
          await expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      options: [{ alwaysAwait: true }],
      errors: [
        {
          line: 2,
          column: 3,
          endColumn: 56,
          messageId: 'asyncMustBeAwaited',
        },
        {
          line: 3,
          column: 10,
          endColumn: 58,
          messageId: 'asyncMustBeAwaited',
        },
      ],
    },
    // alwaysAwait:true, one not awaited, one returned
    {
      code: dedent`
        test("valid-expect", async () => {
          expect(Promise.resolve(2)).resolves.not.toBeDefined();
          return expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).resolves.not.toBeDefined();
          return expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      errors: [
        {
          line: 2,
          column: 3,
          endColumn: 56,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    // one not awaited
    {
      code: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).resolves.not.toBeDefined();
          return expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).resolves.not.toBeDefined();
          await expect(Promise.resolve(1)).rejects.toBeDefined();
        });
      `,
      options: [{ alwaysAwait: true }],
      errors: [
        {
          line: 3,
          column: 10,
          endColumn: 58,
          messageId: 'asyncMustBeAwaited',
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).toResolve();
          return expect(Promise.resolve(1)).toReject();
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(2)).toResolve();
          await expect(Promise.resolve(1)).toReject();
        });
      `,
      options: [{ alwaysAwait: true }],
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          column: 10,
          line: 3,
        },
      ],
    },

    /**
     * Promise.x(expect()) usages
     */
    {
      code: dedent`
        test("valid-expect", () => {
          Promise.resolve(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await Promise.resolve(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      errors: [
        {
          line: 2,
          column: 3,
          endColumn: 73,
          messageId: 'promisesWithAsyncAssertionsMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", () => {
          Promise.reject(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await Promise.reject(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      errors: [
        {
          line: 2,
          column: 3,
          endColumn: 72,
          messageId: 'promisesWithAsyncAssertionsMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", async () => {
          Promise.reject(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await Promise.reject(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      errors: [
        {
          line: 2,
          column: 3,
          endColumn: 72,
          messageId: 'promisesWithAsyncAssertionsMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", () => {
          Promise.x(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await Promise.x(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      errors: [
        {
          line: 2,
          column: 3,
          endColumn: 67,
          messageId: 'promisesWithAsyncAssertionsMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    // alwaysAwait option changes error message
    {
      code: dedent`
        test("valid-expect", () => {
          Promise.resolve(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await Promise.resolve(expect(Promise.resolve(2)).resolves.not.toBeDefined());
        });
      `,
      options: [{ alwaysAwait: true }],
      errors: [
        {
          line: 2,
          column: 3,
          endColumn: 73,
          messageId: 'promisesWithAsyncAssertionsMustBeAwaited',
        },
      ],
    },
    // Promise method accepts arrays and returns 1 error
    {
      code: dedent`
        test("valid-expect", () => {
          Promise.all([
            expect(Promise.resolve(2)).resolves.not.toBeDefined(),
            expect(Promise.resolve(3)).resolves.not.toBeDefined(),
          ]);
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await Promise.all([
            expect(Promise.resolve(2)).resolves.not.toBeDefined(),
            expect(Promise.resolve(3)).resolves.not.toBeDefined(),
          ]);
        });
      `,
      errors: [
        {
          line: 2,
          column: 3,
          endLine: 5,
          endColumn: 5,
          messageId: 'promisesWithAsyncAssertionsMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    // Promise.any([expect1, expect2]) returns one error
    {
      code: dedent`
        test("valid-expect", () => {
          Promise.x([
            expect(Promise.resolve(2)).resolves.not.toBeDefined(),
            expect(Promise.resolve(3)).resolves.not.toBeDefined(),
          ]);
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          await Promise.x([
            expect(Promise.resolve(2)).resolves.not.toBeDefined(),
            expect(Promise.resolve(3)).resolves.not.toBeDefined(),
          ]);
        });
      `,
      errors: [
        {
          line: 2,
          column: 3,
          endLine: 5,
          endColumn: 5,
          messageId: 'promisesWithAsyncAssertionsMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", () => {
          const assertions = [
            expect(Promise.resolve(2)).resolves.not.toBeDefined(),
            expect(Promise.resolve(3)).resolves.not.toBeDefined(),
          ]
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          const assertions = [
            await expect(Promise.resolve(2)).resolves.not.toBeDefined(),
            await expect(Promise.resolve(3)).resolves.not.toBeDefined(),
          ]
        });
      `,
      errors: [
        {
          line: 3,
          column: 5,
          endLine: 3,
          endColumn: 58,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
        {
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 58,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", () => {
          const assertions = [
            expect(Promise.resolve(2)).toResolve(),
            expect(Promise.resolve(3)).toReject(),
          ]
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          const assertions = [
            await expect(Promise.resolve(2)).toResolve(),
            await expect(Promise.resolve(3)).toReject(),
          ]
        });
      `,
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 5,
          line: 3,
        },
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 5,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", () => {
          const assertions = [
            expect(Promise.resolve(2)).not.toResolve(),
            expect(Promise.resolve(3)).resolves.toReject(),
          ]
        });
      `,
      output: dedent`
        test("valid-expect", async () => {
          const assertions = [
            await expect(Promise.resolve(2)).not.toResolve(),
            await expect(Promise.resolve(3)).resolves.toReject(),
          ]
        });
      `,
      errors: [
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 5,
          line: 3,
        },
        {
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
          column: 5,
          line: 4,
        },
      ],
    },
    {
      code: 'expect(Promise.resolve(2)).resolves.toBe;',
      errors: [
        {
          column: 37,
          endColumn: 41,
          messageId: 'matcherNotCalled',
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", () => {
          return expect(functionReturningAPromise()).resolves.toEqual(1).then(() => {
            expect(Promise.resolve(2)).resolves.toBe(1);
          });
        });
      `,
      output: dedent`
        test("valid-expect", () => {
          return expect(functionReturningAPromise()).resolves.toEqual(1).then(async () => {
            await expect(Promise.resolve(2)).resolves.toBe(1);
          });
        });
      `,
      errors: [
        {
          line: 3,
          column: 5,
          endLine: 3,
          endColumn: 48,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", () => {
          return expect(functionReturningAPromise()).resolves.toEqual(1).then(async () => {
            await expect(Promise.resolve(2)).resolves.toBe(1);
            expect(Promise.resolve(4)).resolves.toBe(4);
          });
        });
      `,
      output: dedent`
        test("valid-expect", () => {
          return expect(functionReturningAPromise()).resolves.toEqual(1).then(async () => {
            await expect(Promise.resolve(2)).resolves.toBe(1);
            await expect(Promise.resolve(4)).resolves.toBe(4);
          });
        });
      `,
      errors: [
        {
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 48,
          messageId: 'asyncMustBeAwaited',
          data: { orReturned: ' or returned' },
        },
      ],
    },
    {
      code: dedent`
        test("valid-expect", async () => {
          await expect(Promise.resolve(1));
        });
      `,
      errors: [{ endColumn: 35, column: 9, messageId: 'matcherNotFound' }],
    },
  ],
});
