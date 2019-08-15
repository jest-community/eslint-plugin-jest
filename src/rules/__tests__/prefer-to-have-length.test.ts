import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../prefer-to-have-length';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-to-have-length', rule, {
  valid: [
    'expect(files).toHaveLength(1);',
    "expect(files.name).toBe('file');",
    "expect(files[`name`]).toBe('file');",
    'expect(result).toBe(true);',
    `expect(user.getUserName(5)).resolves.toEqual('Paul')`,
    `expect(user.getUserName(5)).rejects.toEqual('Paul')`,
    'expect(a);',
    'expect(files["length"]).toBe(1);',
  ],

  invalid: [
    // todo: support this
    // {
    //   code: 'expect(files["length"]).toBe(1);',
    //   errors: [{ messageId: 'useToHaveLength', column: 22, line: 1 }],
    //   output: 'expect(files).toHaveLength(1);',
    // },
    {
      code: 'expect(files.length).toBe(1);',
      errors: [{ messageId: 'useToHaveLength', column: 22, line: 1 }],
      output: 'expect(files).toHaveLength(1);',
    },
    {
      code: 'expect(files.length).toEqual(1);',
      errors: [{ messageId: 'useToHaveLength', column: 22, line: 1 }],
      output: 'expect(files).toHaveLength(1);',
    },
  ],
});
