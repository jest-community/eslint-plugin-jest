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

ruleTester.run('no-unnecessary-assertion', rule, {
  valid: withFixtureFilename([
    'expect',
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect.toBeNull',
    'expect.toBeNull()',
    'expect(a).toBe(b)',
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
      const add = (a: number, b: number): number | null => a + b;

      expect(add(1, 1)).not.toBeNull();
    `,
    dedent`
      declare function mx(): string | null;

      expect(mx()).toBeNull();
      expect(mx()).not.toBeNull();
    `,
    dedent`
      declare function mx<T>(p: T): T | null;

      expect(mx(null)).toBeNull();
      expect(mx(null)).not.toBeNull();

      expect(mx('hello')).toBeNull();
      expect(mx('world')).not.toBeNull();
    `,
    'expect(null).not.toBeNull()',
  ]),
  invalid: withFixtureFilename([
    {
      code: 'expect(0).toBeNull()',
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 1,
        },
      ],
    },
    {
      code: 'expect("hello world").toBeNull()',
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 1,
        },
      ],
    },
    {
      code: 'expect({}).toBeNull()',
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 1,
        },
      ],
    },
    {
      code: 'expect([]).not.toBeNull()',
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        const x = 0;

        expect(x).toBeNull()
        expect(x).not.toBeNull()
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        const add = (a: number, b: number): number => a + b;

        expect(add(1, 1)).toBeNull();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const add = (a: number, b: number): number => a + b;

        expect(add(1, 1)).not.toBeNull();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
      ],
    },

    {
      code: dedent`
        const result = "hello world".match("sunshine") ?? [];

        expect(result).not.toBeNull();
        expect(result).toBeNull();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        const result = "hello world".match("sunshine") || [];

        expect(result).not.toBeNull();
        expect(result).toBeNull();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
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
    //     expect(result).not.toBeNull();
    //     expect(result).toBeNull();
    //   `,
    //   errors: [
    //     {
    //       messageId: 'unnecessaryAssertion',
    //       line: 5,
    //     },
    //     {
    //       messageId: 'unnecessaryAssertion',
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
    //     expect(result).not.toBeNull();
    //     expect(result).toBeNull();
    //   `,
    //   errors: [
    //     {
    //       messageId: 'unnecessaryAssertion',
    //       line: 5,
    //     },
    //     {
    //       messageId: 'unnecessaryAssertion',
    //       line: 6,
    //     },
    //   ],
    // },

    {
      code: dedent`
        declare function mx(): string | number;

        expect(mx()).toBeNull();
        expect(mx()).not.toBeNull();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 3,
        },
        {
          messageId: 'unnecessaryAssertion',
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        declare function mx<T>(p: T): T;

        expect(mx(null)).toBeNull();
        expect(mx(null)).not.toBeNull();

        expect(mx('hello')).toBeNull();
        expect(mx('world')).not.toBeNull();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 6,
        },
        {
          messageId: 'unnecessaryAssertion',
          line: 7,
        },
      ],
    },
    {
      code: dedent`
        declare function mx<T>(p: T): T extends string ? null : T;

        expect(mx('hello')).toBeNull();
        expect(mx('world')).not.toBeNull();

        expect(mx({})).toBeNull();
        expect(mx({})).not.toBeNull();
      `,
      errors: [
        {
          messageId: 'unnecessaryAssertion',
          line: 6,
        },
        {
          messageId: 'unnecessaryAssertion',
          line: 7,
        },
      ],
    },
  ]),
});
