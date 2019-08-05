import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-expect-resolves';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
});

ruleTester.run('no-expect-resolves', rule, {
  valid: [
    `test('some test', async () => {
         expect(await Promise.resolve(1)).toBe(1);
     });`,
  ],
  invalid: [
    {
      code: `test('some test', async () => {
             await expect(Promise.resolve(1)).resolves.toBe(1);
         });`,
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 55, column: 20, messageId: 'expectResolves' }],
    },
  ],
});
