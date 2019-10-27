import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-expect-resolves';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
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
      errors: [{ endColumn: 55, column: 47, messageId: 'expectResolves' }],
    },
  ],
});
