import dedent from 'dedent';
import rule from '../no-async-wrapper-for-expected-promise';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('no-async-wrapper-for-expected-promise', rule, {
  valid: [
    'expect.hasAssertions()',
    dedent`
        it('pass', async () => {
            expect();
        })
        `,
    dedent`
        it('pass', async () => {
            await expect(doSomethingAsync()).rejects.toThrow();
        })
        `,
    dedent`
        it('pass', async () => {
            await expect(doSomethingAsync(1, 2)).resolves.toBe(1);
        })
        `,
    dedent`
        it('pass', async () => {
            await expect(async () => {
                await doSomethingAsync();
                await doSomethingTwiceAsync(1, 2);
            }).rejects.toThrow();
        })
        `,
    {
      code: dedent`
        import { expect as pleaseExpect } from '@jest/globals';
        it('pass', async () => {
            await pleaseExpect(doSomethingAsync()).rejects.toThrow();
        })
        `,
      parserOptions: { sourceType: 'module' },
    },
    dedent`
        it('pass', async () => {
            await expect(async () => {
                doSomethingSync();
            }).rejects.toThrow();
        })
    `,
  ],
  invalid: [
    {
      code: dedent`
        it('should be fix', async () => {
            await expect(async () => {
                await doSomethingAsync();
            }).rejects.toThrow(); 
        })
    `,
      output: dedent`
        it('should be fix', async () => {
            await expect(doSomethingAsync()).rejects.toThrow(); 
        })
    `,
      errors: [
        {
          endColumn: 6,
          column: 18,
          messageId: 'noAsyncWrapperForExpectedPromise',
        },
      ],
    },
    {
      code: dedent`
        it('should be fix', async () => {
            await expect(async function () {
                await doSomethingAsync();
            }).rejects.toThrow(); 
        })
    `,
      output: dedent`
        it('should be fix', async () => {
            await expect(doSomethingAsync()).rejects.toThrow(); 
        })
    `,
      errors: [
        {
          endColumn: 6,
          column: 18,
          messageId: 'noAsyncWrapperForExpectedPromise',
        },
      ],
    },
    {
      code: dedent`
        it('should be fix', async () => {
            await expect(async () => {
                await doSomethingAsync(1, 2);
            }).rejects.toThrow(); 
        })
    `,
      output: dedent`
        it('should be fix', async () => {
            await expect(doSomethingAsync(1, 2)).rejects.toThrow(); 
        })
    `,
      errors: [
        {
          endColumn: 6,
          column: 18,
          messageId: 'noAsyncWrapperForExpectedPromise',
        },
      ],
    },
    {
      code: dedent`
        it('should be fix', async () => {
            await expect(async function () {
                await doSomethingAsync(1, 2);
            }).rejects.toThrow(); 
        })
    `,
      output: dedent`
        it('should be fix', async () => {
            await expect(doSomethingAsync(1, 2)).rejects.toThrow(); 
        })
    `,
      errors: [
        {
          endColumn: 6,
          column: 18,
          messageId: 'noAsyncWrapperForExpectedPromise',
        },
      ],
    },
  ],
});
