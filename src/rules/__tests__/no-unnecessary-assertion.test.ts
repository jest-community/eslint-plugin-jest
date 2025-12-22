import path from 'path';
import type { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import type { MessageIds, Options } from '../no-unnecessary-assertion';
import { FlatCompatRuleTester as RuleTester } from './test-utils';

function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
    disallowAutomaticSingleRunInference: true,
  },
});

const fixtureFilename = path.join(rootPath, 'file.ts');

const requireRule = (throwWhenRequiring: boolean) => {
  jest.resetModules();

  TSESLintPluginRef.throwWhenRequiring = throwWhenRequiring;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../no-unnecessary-assertion').default;
};

const TSESLintPluginRef: { throwWhenRequiring: boolean } = {
  throwWhenRequiring: false,
};

jest.mock('typescript', () => {
  if (TSESLintPluginRef.throwWhenRequiring) {
    throw new (class extends Error {
      public code;

      constructor(message?: string) {
        super(message);
        this.code = 'MODULE_NOT_FOUND';
      }
    })();
  }

  return jest.requireActual('typescript');
});

describe('error handling', () => {
  afterAll(() => {
    TSESLintPluginRef.throwWhenRequiring = false;
  });

  it('does not require typescript until the rule is actually created', () => {
    expect(() => requireRule(true)).not.toThrow();
  });
});

const withFixtureFilename = <
  T extends Array<
    | (TSESLint.ValidTestCase<Options> | string)
    | TSESLint.InvalidTestCase<MessageIds, Options>
  >,
>(
  cases: T,
): T extends Array<TSESLint.InvalidTestCase<MessageIds, Options>>
  ? Array<TSESLint.InvalidTestCase<MessageIds, Options>>
  : Array<TSESLint.ValidTestCase<Options>> => {
  // @ts-expect-error this is fine, and will go away later once we upgrade
  return cases.map(code => {
    const test = typeof code === 'string' ? { code } : code;

    return { filename: fixtureFilename, ...test };
  });
};

ruleTester.run('no-unnecessary-assertion (general)', requireRule(false), {
  valid: withFixtureFilename([
    'expect',
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect(a).toBe(b)',
  ]),
  invalid: [
    {
      filename: path.join(rootPath, 'unstrict', 'file.ts'),
      code: 'expect(x).toBe(y);',
      parserOptions: {
        tsconfigRootDir: path.join(rootPath, 'unstrict'),
      },
      errors: [
        {
          messageId: 'noStrictNullCheck',
          line: 0,
        },
      ],
    },
  ],
});

const generateValidCases = (
  matcher: 'toBeNull' | 'toBeUndefined' | 'toBeDefined',
  thing: 'null' | 'undefined',
) => {
  return [
    `expect.${matcher}`,
    `expect.${matcher}()`,
    dedent`
      const add = (a, b) => a + b;

      expect(add(1, 1)).toBe(2);
    `,
    dedent`
      const add = (a: number, b: number) => a + b;

      expect(add(1, 1)).toBe(2);
    `,
    dedent`
      const add = (a: number, b: number): number => a + b;

      expect(add(1, 1)).toBe(2);
    `,
    dedent`
      const add = (a: number, b: number): number | ${thing} => a + b;

      expect(add(1, 1)).not.${matcher}();
    `,
    dedent`
      declare function mx(): string | ${thing};

      expect(mx()).${matcher}();
      expect(mx()).not.${matcher}();
    `,
    dedent`
      declare function mx<T>(p: T): T | ${thing};

      expect(mx(${thing})).${matcher}();
      expect(mx(${thing})).not.${matcher}();

      expect(mx('hello')).${matcher}();
      expect(mx('world')).not.${matcher}();
    `,
    `expect(${thing}).not.${matcher}()`,
    `expect("hello" as ${thing}).${matcher}();`,
    dedent`
      declare function mx(): Promise<string | ${thing}>;

      it('is async', async () => {
        await expect(mx()).resolves.${matcher}();
      });
    `,
    dedent`
      declare function mx(): Promise<string | ${thing}>;

      it('is async', async () => {
        await expect(mx()).rejects.${matcher}();
      });
    `,
    dedent`
      declare function mx(): Promise<string | ${thing}>;

      it('is async', async () => {
        await expect(mx()).rejects.not.${matcher}();
      });
    `,
    dedent`
      declare function mx(): Promise<string | ${thing}>;

      it('is async', async () => {
        expect(await mx()).not.${matcher}();
      });
    `,
    // todo: ideally we should be able to catch these
    dedent`
      declare function mx(): Promise<string>;

      it('is async', async () => {
        await expect(mx()).resolves.${matcher}();
      });
    `,
    dedent`
      declare function mx(): Promise<string>;

      it('is async', async () => {
        await expect(mx()).rejects.not.${matcher}();
      });
    `,
  ];
};

const generateInvalidCases = (
  matcher: 'toBeNull' | 'toBeUndefined' | 'toBeDefined',
  thing: 'null' | 'undefined',
): Array<TSESLint.InvalidTestCase<MessageIds, Options>> => {
  return [
    {
      code: `expect(0).${matcher}()`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 1,
        },
      ],
    },
    {
      code: `expect("hello world").${matcher}()`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 1,
        },
      ],
    },
    {
      code: `expect({}).${matcher}()`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 1,
        },
      ],
    },
    {
      code: `expect([]).not.${matcher}()`,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        const x = 0;

        expect(x).${matcher}()
        expect(x).not.${matcher}()
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        const add = (a: number, b: number) => a + b;

        expect(add(1, 1)).${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const add = (a: number, b: number): number => a + b;

        expect(add(1, 1)).${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const add = (a: number, b: number): number => a + b;

        expect(add(1, 1)).not.${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 3,
        },
      ],
    },

    {
      code: dedent`
        const result = "hello world".match("sunshine") ?? [];

        expect(result).not.${matcher}();
        expect(result).${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        const result = "hello world".match("sunshine") || [];

        expect(result).not.${matcher}();
        expect(result).${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 4,
        },
      ],
    },

    {
      code: dedent`
        declare function mx(): Promise<string>;

        it('is async', async () => {
          expect(await mx()).${matcher}();
        });
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 4,
        },
      ],
    },

    // todo: ideally we should support promises
    // {
    //   code: dedent`
    //     declare function mx(): Promise<string>;
    //
    //     it('is async', async () => {
    //       await expect(mx()).resolves.${matcher}();
    //     });
    //   `,
    //   errors: [
    //     {
    //       messageId: 'unnecessaryAssertion',
    //       data: { thing },
    //       line: 3,
    //     },
    //   ],
    // },

    // todo: ideally support these
    // {
    //   code: dedent`
    //     let result = "hello world".match("sunshine");
    //
    //     result ??= []
    //
    //     expect(result).not.${matcher}();
    //     expect(result).${matcher}();
    //   `,
    //   errors: [
    //     {
    //       messageId: 'unnecessaryAssertion',
    //       data: { thing },
    //       line: 5,
    //     },
    //     {
    //       messageId: 'unnecessaryAssertion',
    //       data: { thing },
    //       line: 6,
    //     },
    //   ],
    // },
    // {
    //   code: dedent`
    //     let result = "hello world".match("sunshine");
    //
    //     result ||= []
    //
    //     expect(result).not.${matcher}();
    //     expect(result).${matcher}();
    //   `,
    //   errors: [
    //     {
    //       messageId: 'unnecessaryAssertion',
    //       data: { thing },
    //       line: 5,
    //     },
    //     {
    //       messageId: 'unnecessaryAssertion',
    //       data: { thing },
    //       line: 6,
    //     },
    //   ],
    // },

    {
      code: dedent`
        declare function mx(): string | number;

        expect(mx()).${matcher}();
        expect(mx()).not.${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        declare function mx<T>(p: T): T;

        expect(mx(${thing})).${matcher}();
        expect(mx(${thing})).not.${matcher}();

        expect(mx('hello')).${matcher}();
        expect(mx('world')).not.${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 6,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 7,
        },
      ],
    },
    {
      code: dedent`
        declare function mx<T>(p: T): T extends string ? ${thing} : T;

        expect(mx('hello')).${matcher}();
        expect(mx('world')).not.${matcher}();

        expect(mx({})).${matcher}();
        expect(mx({})).not.${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 6,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 7,
        },
      ],
    },

    {
      code: dedent`
        declare function mx(): string | ${thing};

        expect(mx()!).${matcher}();
        expect(mx()!).not.${matcher}();

        expect(mx() as string).${matcher}();
        expect(mx() as string).not.${matcher}();

        expect(mx() as number).${matcher}();
        expect(mx() as number).not.${matcher}();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 4,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 6,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 7,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 9,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing },
          line: 10,
        },
      ],
    },
  ];
};

ruleTester.run('no-unnecessary-assertion (toBeNull)', requireRule(false), {
  valid: withFixtureFilename(generateValidCases('toBeNull', 'null')),
  invalid: withFixtureFilename(generateInvalidCases('toBeNull', 'null')),
});

ruleTester.run('no-unnecessary-assertion (toBeDefined)', requireRule(false), {
  valid: withFixtureFilename(generateValidCases('toBeDefined', 'undefined')),
  invalid: withFixtureFilename(
    generateInvalidCases('toBeDefined', 'undefined'),
  ),
});

ruleTester.run('no-unnecessary-assertion (toBeUndefined)', requireRule(false), {
  valid: withFixtureFilename(generateValidCases('toBeUndefined', 'undefined')),
  invalid: withFixtureFilename(
    generateInvalidCases('toBeUndefined', 'undefined'),
  ),
});

ruleTester.run('no-unnecessary-assertion (toBeNaN)', requireRule(false), {
  valid: withFixtureFilename([
    `expect.toBeNaN`,
    `expect.toBeNaN()`,
    'expect(0).toBeNaN()',
    'expect(0).not.toBeNaN()',
    dedent`
      const x = 0;

      expect(x).toBeNaN()
      expect(x).not.toBeNaN()
    `,
    dedent`
      const add = (a, b) => a + b;

      expect(add(1, 1)).toBe(2);
    `,
    dedent`
      const add = (a: number, b: number) => a.toString() + b.toString();

      expect(add(1, 1)).toBe(2);
    `,
    dedent`
      const add = (a: number, b: number): string => a.toString() + b.toString();

      expect(add(1, 1)).toBe(2);
    `,
    dedent`
      const add = (a: number, b: number): string | number => a.toString() + b.toString();

      expect(add(1, 1)).toBe(2);
    `,
    dedent`
      const add = (a: number, b: number): string | number => a.toString() + b.toString();

      expect(add(1, 1)).toBeNaN();
    `,
    dedent`
      const add = (a: number, b: number): string | number => a + b;

      expect(add(1, 1)).not.toBeNaN();
    `,
    dedent`
      declare function mx(): string | number;

      expect(mx()).toBeNaN();
      expect(mx()).not.toBeNaN();
    `,
    dedent`
      declare function mx<T>(p: T): T | number;

      expect(mx(42)).toBeNaN();
      expect(mx(4.2)).toBeNaN();
      expect(mx(Infinity)).not.toBeNaN();

      expect(mx('hello')).toBeNaN();
      expect(mx('world')).not.toBeNaN();
    `,
    `expect("hello" as number).toBeNaN();`,
  ]),
  invalid: withFixtureFilename([
    {
      code: 'expect("hello world").toBeNaN()',
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 1,
        },
      ],
    },
    {
      code: 'expect({}).toBeNaN()',
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 1,
        },
      ],
    },
    {
      code: 'expect([]).not.toBeNaN()',
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        const x = 'hello world';

        expect(x).toBeNaN()
        expect(x).not.toBeNaN()
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        const join = (a: string, b: string) => a + b;

        expect(join('hello', 'world')).toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const join = (a: string, b: string): string => a + b;

        expect(join('hello', 'world')).toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const join = (a: string, b: string): string => a + b;

        expect(join('hello', 'world')).not.toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 3,
        },
      ],
    },

    {
      code: dedent`
        const result = "hello world".match("sunshine") ?? [];

        expect(result).not.toBeNaN();
        expect(result).toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        const result = "hello world".match("sunshine") || [];

        expect(result).not.toBeNaN();
        expect(result).toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 4,
        },
      ],
    },

    {
      code: dedent`
        declare function mx(): string | null;

        expect(mx()).toBeNaN();
        expect(mx()).not.toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        declare function mx<T>(p: T): T;

        expect(mx(0)).toBeNaN();
        expect(mx(1)).not.toBeNaN();
        expect(mx(NaN)).not.toBeNaN();

        expect(mx('hello')).toBeNaN();
        expect(mx('world')).not.toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 7,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        declare function mx<T>(p: T): T extends string ? number : T;

        expect(mx('hello')).toBeNaN();
        expect(mx('world')).not.toBeNaN();

        expect(mx({})).toBeNaN();
        expect(mx({})).not.toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 6,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 7,
        },
      ],
    },

    {
      code: dedent`
        declare function mx(): string | number;

        expect(mx() as string).toBeNaN();
        expect(mx() as string).not.toBeNaN();

        expect(mx() as number).toBeNaN();
        expect(mx() as number).not.toBeNaN();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          data: { thing: 'a number' },
          line: 4,
        },
      ],
    },
  ]),
});
