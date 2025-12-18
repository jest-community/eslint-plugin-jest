import path from 'path';
import type { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule, {
  type MessageIds,
  type Options,
} from '../no-unnecessary-assertion';
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
  },
});

const fixtureFilename = path.join(rootPath, 'file.ts');

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

ruleTester.run('no-unnecessary-assertion (general)', rule, {
  valid: withFixtureFilename([
    'expect',
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect(a).toBe(b)',
  ]),
  invalid: [],
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

ruleTester.run('no-unnecessary-assertion (toBeNull)', rule, {
  valid: withFixtureFilename(generateValidCases('toBeNull', 'null')),
  invalid: withFixtureFilename(generateInvalidCases('toBeNull', 'null')),
});

ruleTester.run('no-unnecessary-assertion (toBeDefined)', rule, {
  valid: withFixtureFilename(generateValidCases('toBeDefined', 'undefined')),
  invalid: withFixtureFilename(
    generateInvalidCases('toBeDefined', 'undefined'),
  ),
});

ruleTester.run('no-unnecessary-assertion (toBeUndefined)', rule, {
  valid: withFixtureFilename(generateValidCases('toBeUndefined', 'undefined')),
  invalid: withFixtureFilename(
    generateInvalidCases('toBeUndefined', 'undefined'),
  ),
});
