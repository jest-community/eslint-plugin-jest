import { RuleTester } from 'eslint';
import rule from '../no-snapshots';

const ruleTester = new RuleTester();

ruleTester.run('no-snapshots', rule, {
  valid: [
    `expect(foo).toHaveProperty('foo');`,
    `expect(a)`,
    `toMatchSnapshot();`,
    `toMatchInlineSnapshot()`,
    `toThrowErrorMatchingSnapshot()`,
    `toThrowErrorMatchingInlineSnapshot()`,
  ],
  invalid: [
    {
      code: 'expect(foo).toMatchSnapshot();',
      errors: [{ messageId: 'noSnapshots' }],
    },
    {
      code: 'expect(foo).toMatchInlineSnapshot();',
      errors: [{ messageId: 'noSnapshots' }],
    },
    {
      code: 'expect(foo).toThrowErrorMatchingSnapshot();',
      errors: [{ messageId: 'noSnapshots' }],
    },
    {
      code: 'expect(foo).toThrowErrorMatchingInlineSnapshot();',
      errors: [{ messageId: 'noSnapshots' }],
    },
  ],
});
