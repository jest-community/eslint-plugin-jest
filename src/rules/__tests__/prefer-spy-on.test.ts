import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import rule from '../prefer-spy-on';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
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
      code: 'obj.a = jest.fn(() => 10)',
      output: "jest.spyOn(obj, 'a').mockImplementation(() => 10)",
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
  ],
});
