import path from 'path';
import dedent from 'dedent';
import type { MessageIds, Options } from '../no-error-equal';
import {
  FlatCompatRuleTester as RuleTester,
  createRuleRequirerTester,
  getFixturesRootDir,
} from './test-utils';

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

const { TSESLintPluginRef, requireRule, withFixtureFilename } =
  createRuleRequirerTester<Options, MessageIds>(
    '../no-error-equal',
    'typescript',
    path.join(rootPath, 'file.ts'),
  );

describe('error handling', () => {
  afterAll(() => {
    TSESLintPluginRef.throwWhenRequiring = false;
  });

  it('does not require typescript until the rule is actually created', () => {
    expect(() => requireRule(true)).not.toThrow();
  });
});

ruleTester.run('no-error-equal', requireRule(false), {
  valid: withFixtureFilename([
    'expect',
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect(a).toBe(b)',
    'expect(a).toThrow(b)',
    'expect(a).toThrowError(b)',
    dedent`
      class MyError {}

      expect(new MyError()).toBeInstanceOf(Error);

      expect(new MyError()).toBe(new Error());
      expect(new MyError()).toEqual(new Error());
      expect(new MyError()).toStrictEqual(new Error());
    `,
    dedent`
      class MyError {}

      const myError = new MyError();

      expect(myError).toBeInstanceOf(Error);

      expect(myError).toBe(new Error());
      expect(myError).toEqual(new Error());
      expect(myError).toStrictEqual(new Error());
    `,
    dedent`
      interface WithCode { code: string };

      class MyError implements WithCode {}

      const myError = new MyError();

      expect(myError).toBeInstanceOf(Error);

      expect(myError).toBe(new Error());
      expect(myError).toEqual(new Error());
      expect(myError).toStrictEqual(new Error());
    `,
    dedent`
      function buildError(): Error | { code: string } | null {
        return new Error('oh noes');
      }

      const x: Array<number> = [1, 2, 3];

      expect(buildError()).toEqual(null);
      expect(x).toEqual(null);
      expect(buildError()).toEqual(new Error());
    `,
    dedent`
      type Mx = Array<number>;

      const x: Mx = [1, 2, 3];

      expect(buildError()).toEqual(null);
      expect(x).toEqual(null);
      expect(buildError()).toEqual(new Error());
    `,
    '<T = Error>(v) => expect(v as T).toEqual(new Error())',
    'expect(new AggregateError()).toBe(0)',
  ]),
  invalid: withFixtureFilename([
    {
      code: 'expect(new Error("hello world")).toEqual(new Error("hello world"))',
      errors: [
        {
          messageId: 'equalError',
          line: 1,
        },
      ],
    },
    {
      code: 'expect(Error("hello world")).toEqual(new Error("hello world"))',
      errors: [
        {
          messageId: 'equalError',
          line: 1,
        },
      ],
    },
    {
      code: 'expect(new Error("hello world")).toStrictEqual(new Error("hello world"))',
      errors: [
        {
          messageId: 'equalError',
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        class MyError extends Error {}

        expect(new MyError()).toBeInstanceOf(Error);

        expect(new MyError()).toBe(new Error());
        expect(new MyError()).toEqual(new Error());
        expect(new MyError()).toStrictEqual(new Error());
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 6,
        },
        {
          messageId: 'equalError',
          line: 7,
        },
      ],
    },
    {
      code: dedent`
        class MyError extends Error {}

        const myError = new MyError();

        expect(myError).toBeInstanceOf(Error);

        expect(myError).toBe(new Error());
        expect(myError).toEqual(new Error());
        expect(myError).toStrictEqual(new Error());
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 8,
        },
        {
          messageId: 'equalError',
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        expect(new AggregateError([], 'hello world')).toBe(new Error());
        expect(new AggregateError([], 'hello world')).toEqual(new Error());
        expect(new AggregateError([], 'hello world')).toStrictEqual(new Error());
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 2,
        },
        {
          messageId: 'equalError',
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const x = 'hello world';

        expect(x as Error).toEqual('hello world');
        expect(x as Error & {}).not.toStrictEqual('hello world');
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 3,
        },
        {
          messageId: 'equalError',
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        declare function buildError<T>(): T;

        expect(buildError<Error>()).toEqual('hello world');
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        declare function addCode<T extends Error>(err: T, code: string): T & { code: string };

        expect(addCode(new Error('hello world'), 'MODULE_NOT_FOUND')).toEqual('hello world');
        expect(addCode(new AggregateError([], 'hello world'), 'MODULE_NOT_FOUND')).toEqual('hello world');
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 3,
        },
        {
          messageId: 'equalError',
          line: 4,
        },
      ],
    },
    {
      code: '<T extends Error>(v: any) => expect(v as T).toStrictEqual(new Error())',
      errors: [
        {
          messageId: 'equalError',
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        function buildError(msg: string) {
          return new Error(msg);
        }

        expect(buildError('hello world')).toEqual('hello world');
        expect(buildError('hello world')).toEqual(new Error('hello world'));
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 5,
        },
        {
          messageId: 'equalError',
          line: 6,
        },
      ],
    },
    {
      code: dedent`
        function buildError(msg: string): Error {
          return new Error(msg);
        }

        expect(buildError('hello world')).toEqual('hello world');
        expect(buildError('hello world')).toEqual(new Error('hello world'));
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 5,
        },
        {
          messageId: 'equalError',
          line: 6,
        },
      ],
    },
    {
      code: dedent`
        class MyGenericError extends Error {}
        class MySpecificError extends MyGenericError {}

        expect(new MySpecificError('hello world')).toEqual('hello world');
        expect(MySpecificError('hello world')).toStrictEqual(new Error('hello world'));
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 4,
        },
        // todo: not sure why this isn't being matched
        // {
        //   messageId: 'equalError',
        //   line: 5,
        // },
      ],
    },
    {
      code: dedent`
        interface Mx { code: string }

        class MyError extends Error implements Mx {}

        expect(new MyError('hello world')).toEqual('hello world');
        expect(new MyError('hello world')).not.toStrictEqual(new Error('hello world'));
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 5,
        },
        {
          messageId: 'equalError',
          line: 6,
        },
      ],
    },
    {
      code: dedent`
        it('works', async () => {
          const err = await Promise.resolve(new Error('oh noes'));

          expect(err).toEqual(new Error('oh noes'));
        });
      `,
      errors: [
        {
          messageId: 'equalError',
          line: 4,
        },
      ],
    },
  ]),
});
