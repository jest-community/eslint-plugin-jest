import { RuleTester } from 'eslint';
import rule from '../no-try-expect';

const ruleTester = new RuleTester({
  parser: require.resolve('babel-eslint'),
});

const errors = [
  {
    messageId: 'noTryExpect',
  },
];

ruleTester.run('no-try-catch', rule, {
  valid: [
    {
      code: `it('foo', () => {
        expect('foo').toEqual('foo');
      })`,
    },
    {
      code: `
        it('foo', () => {
          expect('bar').toEqual('bar');
        });
        try {

        } catch {
          expect('foo').toEqual('foo');
        }`,
    },
    {
      code: `
        it.skip('foo');
        try {

        } catch {
          expect('foo').toEqual('foo');
        }`,
    },
  ],
  invalid: [
    {
      code: `it('foo', () => {
        try {

        } catch (err) {
          expect(err).toMatch('Error');
        }
      })`,
      errors,
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
      errors,
    },
  ],
});
