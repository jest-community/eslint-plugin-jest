'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-test-todo');

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('no-test-todo', rule, {
  valid: [
    'it("test description", () => {})',
    'test("test description", () => {})',
    'test.only("test description", () => {})',
    'test.skip("test description", () => {})',
  ],

  invalid: [
    {
      code: 'it.todo("test description")',
      errors: [{ messageId: 'no-test-todo' }],
    },
    {
      code: 'test.todo("test description")',
      errors: [{ messageId: 'no-test-todo' }],
    },
  ],
});
