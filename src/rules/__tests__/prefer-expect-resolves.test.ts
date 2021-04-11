import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../prefer-expect-resolves';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
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
      errors: [{ endColumn: 27, column: 10, messageId: 'expectResolves' }],
    },
    {
      code: dedent`
        it('is true', async () => {
          const myPromise = Promise.resolve(true);

          expect(await myPromise).toBe(true);
        });
      `,
      errors: [{ endColumn: 25, column: 10, messageId: 'expectResolves' }],
    },
  ],
});
