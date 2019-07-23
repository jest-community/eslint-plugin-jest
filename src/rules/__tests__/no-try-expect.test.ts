import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-try-expect';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 9,
  },
});

ruleTester.run('no-try-catch', rule, {
  valid: [
    `it('foo', () => {
        expect('foo').toEqual('foo');
    })`,
    `it('foo', () => {
      expect('bar').toEqual('bar');
    });
    try {

    } catch(e) {
      expect('foo').toEqual('foo');
    }`,
    `it.skip('foo');
    try {

    } catch(e) {
      expect('foo').toEqual('foo');
    }`,
  ],
  invalid: [
    {
      code: `it('foo', () => {
        try {

        } catch (err) {
          expect(err).toMatch('Error');
        }
      })`,
      errors: [
        {
          messageId: 'noTryExpect',
        },
      ],
    },
    {
      code: `it('foo', async () => {
        await wrapper('production', async () => {
          try {

          } catch (err) {
            expect(err).toMatch('Error');
          }
        })
      })`,
      errors: [
        {
          messageId: 'noTryExpect',
        },
      ],
    },
  ],
});
