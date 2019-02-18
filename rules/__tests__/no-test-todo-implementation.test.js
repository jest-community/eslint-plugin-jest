'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-test-todo-implementation');

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('no-test-todo-implementation', rule, {
  valid: [
    "it('test description', () => {});",
    "test('test description', () => { });",
    "it.skip('test description', () => { });",
    "it.only('test description', () => { });",
    "it.todo('test description');",
  ],
  invalid: [
    {
      code: "it.todo('test description', () => {})",
      errors: [{ messageId: 'no-test-todo-implementation' }],
    },
    {
      code: "it.todo('test description', () => { expect(true).toBe(true) });",
      errors: [{ messageId: 'no-test-todo-implementation' }],
    },
  ],
});
