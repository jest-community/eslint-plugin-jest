import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../prefer-expect-resolves';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('prefer-expect-resolves', rule, {
  valid: [
    dedent`
      it('passes', async () => {
        await expect(someValue()).resolves.toBe(true);
      });
    `,
    dedent`
      it('is true', async () => {
        const myPromise = Promise.resolve(true);

        await expect(myPromise).resolves.toBe(true);
      });
    `,
    dedent`
      it('errors', async () => {
        await expect(Promise.rejects('oh noes!')).rejects.toThrow('oh noes!');
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        it('passes', async () => {
          expect(await someValue()).toBe(true);
        });
      `,
      output: dedent`
        it('passes', async () => {
          await expect(someValue()).resolves.toBe(true);
        });
      `,
      errors: [{ endColumn: 27, column: 10, messageId: 'expectResolves' }],
    },
    {
      code: dedent`
        it('is true', async () => {
          const myPromise = Promise.resolve(true);

          expect(await myPromise).toBe(true);
        });
      `,
      output: dedent`
        it('is true', async () => {
          const myPromise = Promise.resolve(true);

          await expect(myPromise).resolves.toBe(true);
        });
      `,
      errors: [{ endColumn: 25, column: 10, messageId: 'expectResolves' }],
    },
  ],
});
