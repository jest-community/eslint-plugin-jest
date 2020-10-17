import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../prefer-inline-snapshots';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('prefer-inline-snapshots', rule, {
  valid: [
    'expect(something).toMatchInlineSnapshot();',
    'expect(something).toThrowErrorMatchingInlineSnapshot();',
  ],
  invalid: [
    {
      code: 'expect(something).toMatchSnapshot();',
      output: 'expect(something).toMatchInlineSnapshot();',
      errors: [{ messageId: 'toMatch', column: 19, line: 1 }],
    },
    {
      code: 'expect(something).toThrowErrorMatchingSnapshot();',
      output: 'expect(something).toThrowErrorMatchingInlineSnapshot();',
      errors: [{ messageId: 'toMatchError', column: 19, line: 1 }],
    },
  ],
});
