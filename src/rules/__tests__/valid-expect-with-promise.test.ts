import path from 'path';
import type { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import type { MessageIds, Options } from '../valid-expect-with-promise';
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
  return require('../valid-expect-with-promise').default;
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

ruleTester.run('valid-expect-with-promise', requireRule(false), {
  valid: withFixtureFilename([
    'expect',
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect(a).toBe(b)',
    'expect(Promise.resolve()).resolves.toBe(1)',
    'expect(Promise.resolve()).rejects.toBe(1)',
    dedent`
      it('is correct', async () => {
        await expect(Promise.resolve()).rejects.toEqual(1);
        await expect(Promise.reject()).resolves.not.toStrictEqual(1);

        expect(await Promise.resolve()).toEqual(1);
      });
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
      const x: Array<number> = [1, 2, 3];

      it('is true', async () => {
        expect(x).toEqual(null);
      });
    `,
    '<T extends Promise<unknown> = Promise<string>>(v: T) => expect(v).resolves.toThrow()',
    '<T = string>(v: T) => expect(v).toBe(1)',
  ]),
  invalid: withFixtureFilename([
    {
      code: 'expect(Promise.resolve()).toBe(1)',
      errors: [
        {
          messageId: 'poorlyExpectedPromise',
          line: 1,
        },
      ],
    },
    {
      code: 'expect(new Promise(r => r())).toBe(1)',
      errors: [
        {
          messageId: 'poorlyExpectedPromise',
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        const x = 'hello world';

        expect(x as Promise<number>).toEqual('hello world');
        expect(x as Promise<string[]> & Array<string>).not.toStrictEqual('hello world');
        expect(x as Promise<string[]> | Array<string>).not.toStrictEqual('hello world');
      `,
      errors: [
        {
          messageId: 'poorlyExpectedPromise',
          line: 3,
        },
        {
          messageId: 'poorlyExpectedPromise',
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        declare function build<T>(): T;

        expect(build<Promise<string>>()).toEqual('hello world');
      `,
      errors: [
        {
          messageId: 'poorlyExpectedPromise',
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        class MyPromise extends Promise<unknown> {};

        declare function build<T extends Promise<number>>(): T;

        expect(build<typeof MyPromise>()).toEqual('hello world');
      `,
      errors: [
        {
          messageId: 'poorlyExpectedPromise',
          line: 5,
        },
      ],
    },
    {
      code: dedent`
        async function promiseValue(value: string): Promise<string> {
          return value;
        }

        expect(promiseValue('hello world')).toEqual('hello world');
        expect(promiseValue()).not.toEqual([]);
      `,
      errors: [
        {
          messageId: 'poorlyExpectedPromise',
          line: 5,
        },
        {
          messageId: 'poorlyExpectedPromise',
          line: 6,
        },
      ],
    },
    {
      code: dedent`
        class PromisedString extends Promise<string> {}

        it('works', async () => {
          await expect(PromisedString.resolve("hello sunshine")).toEqual(1);
          await expect(new PromisedString(r => r("value"))).toEqual(1);
        });
      `,
      errors: [
        {
          messageId: 'poorlyExpectedPromise',
          line: 4,
        },
        {
          messageId: 'poorlyExpectedPromise',
          line: 5,
        },
      ],
    },
    // technically this is valid, but we choose not to give it special treatment
    // as it should be very rare and doing so could give a lot of false negatives
    {
      code: 'expect(Promise.resolve()).toBeInstanceOf(Promise);',
      errors: [
        {
          messageId: 'poorlyExpectedPromise',
          line: 1,
        },
      ],
    },

    //
    {
      code: 'expect("hello world").resolves.toContain(1)',
      errors: [
        {
          messageId: 'unneededRejectResolve',
          data: { modifier: 'resolves' },
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: 'expect({}).rejects.not.toContain(1)',
      errors: [
        {
          messageId: 'unneededRejectResolve',
          data: { modifier: 'rejects' },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: dedent`
        it('works', async () => {
          await expect(0).resolves.toEqual(1);
        });
      `,
      errors: [
        {
          messageId: 'unneededRejectResolve',
          data: { modifier: 'resolves' },
          line: 2,
          column: 19,
        },
      ],
    },
    {
      code: dedent`
        class PromisedString extends Promise<string> {}

        it('works', async () => {
          const value = await PromisedString.resolve("hello sunshine");

          await expect(value).resolves.toEqual(1);
        });
      `,
      errors: [
        {
          messageId: 'unneededRejectResolve',
          data: { modifier: 'resolves' },
          line: 6,
          column: 23,
        },
      ],
    },
  ]),
});
