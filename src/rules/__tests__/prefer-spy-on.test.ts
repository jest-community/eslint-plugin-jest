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
    "test('', () => { Date.now = () => 10; });",
    "test('', () => { window.fetch = jest.fn; });",
    "test('', () => { Date.now = fn(); });",
    "test('', () => { obj.mock = jest.something(); });",
    "test('', () => { const mock = jest.fn(); });",
    "test('', () => { mock = jest.fn(); });",
    "test('', () => { const mockObj = { mock: jest.fn() }; });",
    "test('', () => { mockObj = { mock: jest.fn() }; });",
    "test('', () => { window[`${name}`] = jest[`fn${expression}`](); });",
    "test('', () => jest.spyOn(Date, 'now'));",
    'Date.now = jest.fn();',
  ],
  invalid: [
    {
      code: "test('', () => { obj.a = jest.fn(); const test = 10; });",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: "test('', () => { jest.spyOn(obj, 'a'); const test = 10; });",
    },
    {
      code: "test('', () => { Date['now'] = jest['fn'](); });",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: "test('', () => { jest.spyOn(Date, 'now'); });",
    },
    {
      code: "test('', () => { window[`${name}`] = jest[`fn`](); });",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: "test('', () => { jest.spyOn(window, `${name}`); });",
    },
    {
      code: "test('', () => { obj['prop' + 1] = jest['fn'](); });",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output: "test('', () => { jest.spyOn(obj, 'prop' + 1); });",
    },
    {
      code: "test('', () => { obj.one.two = jest.fn(); const test = 10; });",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output:
        "test('', () => { jest.spyOn(obj.one, 'two'); const test = 10; });",
    },
    {
      code: "test('', () => { obj.a = jest.fn(() => 10); });",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output:
        "test('', () => { jest.spyOn(obj, 'a').mockImplementation(() => 10); });",
    },
    {
      code:
        "test('', () => { obj.a.b = jest.fn(() => ({})).mockReturnValue('default').mockReturnValueOnce('first call'); test(); });",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output:
        "test('', () => { jest.spyOn(obj.a, 'b').mockImplementation(() => ({})).mockReturnValue('default').mockReturnValueOnce('first call'); test(); });",
    },
    {
      code:
        "test('', () => { window.fetch = jest.fn(() => ({})).one.two().three().four; });",
      errors: [
        {
          messageId: 'useJestSpyOn',
          type: AST_NODE_TYPES.AssignmentExpression,
        },
      ],
      output:
        "test('', () => { jest.spyOn(window, 'fetch').mockImplementation(() => ({})).one.two().three().four; });",
    },
  ],
});
