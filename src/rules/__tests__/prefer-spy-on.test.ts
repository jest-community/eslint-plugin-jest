import {
  AST_NODE_TYPES,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import rule from '../prefer-spy-on';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 6,
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
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: "jest.spyOn(obj, 'a').mockImplementation(); const test = 10;",
    },
    {
      code: "Date['now'] = jest['fn']()",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: "jest.spyOn(Date, 'now').mockImplementation()",
    },
    {
      code: 'window[`${name}`] = jest[`fn`]()',
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: 'jest.spyOn(window, `${name}`).mockImplementation()',
    },
    {
      code: "obj['prop' + 1] = jest['fn']()",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: "jest.spyOn(obj, 'prop' + 1).mockImplementation()",
    },
    {
      code: 'obj.one.two = jest.fn(); const test = 10;',
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output:
        "jest.spyOn(obj.one, 'two').mockImplementation(); const test = 10;",
    },
    {
      code: 'obj.a = jest.fn(() => 10)',
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: "jest.spyOn(obj, 'a').mockImplementation(() => 10)",
    },
    {
      code:
        "obj.a.b = jest.fn(() => ({})).mockReturnValue('default').mockReturnValueOnce('first call'); test();",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output:
        "jest.spyOn(obj.a, 'b').mockImplementation(() => ({})).mockReturnValue('default').mockReturnValueOnce('first call'); test();",
    },
    {
      code: 'window.fetch = jest.fn(() => ({})).one.two().three().four',
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output:
        "jest.spyOn(window, 'fetch').mockImplementation(() => ({})).one.two().three().four",
    },
  ],
});
