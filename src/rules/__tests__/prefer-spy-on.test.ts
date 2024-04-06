import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import rule from '../prefer-spy-on';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-spy-on', rule, {
  valid: [
    'Date.now = () => 10',
    'window.fetch = jest.fn',
    'Date.now = fn()',
    'obj.mock = jest.something()',
    'const mock = jest.fn()',
    'mock = jest.fn()',
    'const mockObj = { mock: jest.fn() }',
    'mockObj = { mock: jest.fn() }',
    'window[`${name}`] = jest[`fn${expression}`]()',
  ],
  invalid: [
    {
      code: 'obj.a = jest.fn(); const test = 10;',
      output: "jest.spyOn(obj, 'a').mockImplementation(); const test = 10;",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: "Date['now'] = jest['fn']()",
      output: "jest.spyOn(Date, 'now').mockImplementation()",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: 'window[`${name}`] = jest[`fn`]()',
      output: 'jest.spyOn(window, `${name}`).mockImplementation()',
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: "obj['prop' + 1] = jest['fn']()",
      output: "jest.spyOn(obj, 'prop' + 1).mockImplementation()",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: 'obj.one.two = jest.fn(); const test = 10;',
      output:
        "jest.spyOn(obj.one, 'two').mockImplementation(); const test = 10;",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: 'obj.a = jest.fn(() => 10,)',
      output: "jest.spyOn(obj, 'a').mockImplementation(() => 10)",
      parserOptions: { ecmaVersion: 2017 },
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: "obj.a.b = jest.fn(() => ({})).mockReturnValue('default').mockReturnValueOnce('first call'); test();",
      output:
        "jest.spyOn(obj.a, 'b').mockImplementation(() => ({})).mockReturnValue('default').mockReturnValueOnce('first call'); test();",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      code: 'window.fetch = jest.fn(() => ({})).one.two().three().four',
      output:
        "jest.spyOn(window, 'fetch').mockImplementation(() => ({})).one.two().three().four",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      // https://github.com/jest-community/eslint-plugin-jest/issues/1304
      code: 'foo[bar] = jest.fn().mockReturnValue(undefined)',
      output:
        'jest.spyOn(foo, bar).mockImplementation().mockReturnValue(undefined)',
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
    {
      // https://github.com/jest-community/eslint-plugin-jest/issues/1307
      code: `
        foo.bar = jest.fn().mockImplementation(baz => baz)
        foo.bar = jest.fn(a => b).mockImplementation(baz => baz)
      `,
      output: `
        jest.spyOn(foo, 'bar').mockImplementation(baz => baz)
        jest.spyOn(foo, 'bar').mockImplementation(baz => baz)
      `,
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
    },
  ],
});
