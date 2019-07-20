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
      errors: [{ messageId: 'toMatch', column: 19, line: 1 }],
      output: 'expect(something).toMatchInlineSnapshot();',
    },
    {
      code: 'expect(something).toThrowErrorMatchingSnapshot();',
      errors: [{ messageId: 'toMatchError', column: 19, line: 1 }],
      output: 'expect(something).toThrowErrorMatchingInlineSnapshot();',
    },
  ],
});
