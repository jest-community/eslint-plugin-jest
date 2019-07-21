import { RuleTester } from 'eslint';
import rule from '../no-try-expect';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2019,
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

    } catch {
      expect('foo').toEqual('foo');
    }`,
    `it.skip('foo');
    try {

    } catch {
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
