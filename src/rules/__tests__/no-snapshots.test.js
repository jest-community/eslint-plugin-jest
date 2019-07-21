import { RuleTester } from 'eslint';
import rule from '../no-snapshots';

const ruleTester = new RuleTester();

const errors = [{ messageId: 'noSnapshots' }];

ruleTester.run('no-snapshots', rule, {
  valid: [
    {
      code: `expect(foo).toHaveProperty('foo');`,
    },
  ],
  invalid: [
    {
      code: 'expect(foo).toMatchSnapshot();',
      errors,
    },
    {
      code: 'expect(foo).toMatchInlineSnapshot();',
      errors,
    },
    {
      code: 'expect(foo).toThrowErrorMatchingSnapshot();',
      errors,
    },
    {
      code: 'expect(foo).toThrowErrorMatchingInlineSnapshot();',
      errors,
    },
  ],
});
