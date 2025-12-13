import rule from '../prefer-to-have-length';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2020,
  },
});

ruleTester.run('prefer-to-have-length', rule, {
  valid: [
    'expect.hasAssertions',
    'expect.hasAssertions()',
    'expect(files).toHaveLength(1);',
    "expect(files.name).toBe('file');",
    "expect(files[`name`]).toBe('file');",
    'expect(users[0]?.permissions?.length).toBe(1);',
    'expect(result).toBe(true);',
    `expect(user.getUserName(5)).resolves.toEqual('Paul')`,
    `expect(user.getUserName(5)).rejects.toEqual('Paul')`,
    'expect(a);',
  ],

  invalid: [
    {
      code: 'expect(files["length"]).toBe(1);',
      output: 'expect(files).toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 25, line: 1 }],
    },
    {
      code: 'expect(files["length"]).toBe(1,);',
      output: 'expect(files).toHaveLength(1,);',
      parserOptions: { ecmaVersion: 2017 },
      errors: [{ messageId: 'useToHaveLength', column: 25, line: 1 }],
    },
    {
      code: 'expect(files["length"])["not"].toBe(1);',
      output: 'expect(files)["not"].toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 32, line: 1 }],
    },
    {
      code: 'expect(files["length"])["toBe"](1);',
      output: 'expect(files).toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 25, line: 1 }],
    },
    {
      code: 'expect(files["length"]).not["toBe"](1);',
      output: 'expect(files).not.toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 29, line: 1 }],
    },
    {
      code: 'expect(files["length"])["not"]["toBe"](1);',
      output: 'expect(files)["not"].toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 32, line: 1 }],
    },
    {
      code: 'expect(files.length).toBe(1);',
      output: 'expect(files).toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 22, line: 1 }],
    },
    {
      code: 'expect(files.length).toEqual(1);',
      output: 'expect(files).toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 22, line: 1 }],
    },
    {
      code: 'expect(files.length).toStrictEqual(1);',
      output: 'expect(files).toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 22, line: 1 }],
    },
    {
      code: 'expect(files.length).not.toStrictEqual(1);',
      output: 'expect(files).not.toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 26, line: 1 }],
    },
    {
      code: 'expect(x.files.length).not.toStrictEqual(1);',
      output: 'expect(x.files).not.toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 28, line: 1 }],
    },
    {
      code: 'expect(x["files"].length).not.toStrictEqual(1);',
      output: 'expect(x["files"]).not.toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 31, line: 1 }],
    },
    {
      code: 'expect(x.y.z.length).not.toStrictEqual(1);',
      output: 'expect(x.y.z).not.toHaveLength(1);',
      errors: [{ messageId: 'useToHaveLength', column: 26, line: 1 }],
    },
  ],
});
