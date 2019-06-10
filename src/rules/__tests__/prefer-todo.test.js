'use strict';

const { RuleTester } = require('eslint');
const rule = require('../prefer-todo');

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015 },
});

ruleTester.run('prefer-todo', rule, {
  valid: [
    'test.todo("i need to write this test");',
    'test(obj)',
    'fit("foo")',
    'xit("foo")',
    'test("stub", () => expect(1).toBe(1));',
    `
      supportsDone && params.length < test.length
        ? done => test(...params, done)
        : () => test(...params);
    `,
  ],
  invalid: [
    {
      code: `test("i need to write this test");`,
      errors: [{ messageId: 'todoOverUnimplemented' }],
      output: 'test.todo("i need to write this test");',
    },
    {
      code: 'test(`i need to write this test`);',
      errors: [{ messageId: 'todoOverUnimplemented' }],
      output: 'test.todo(`i need to write this test`);',
    },
    {
      code: 'it("foo", function () {})',
      errors: [{ messageId: 'todoOverEmpty' }],
      output: 'it.todo("foo")',
    },
    {
      code: 'it("foo", () => {})',
      errors: [{ messageId: 'todoOverEmpty' }],
      output: 'it.todo("foo")',
    },
    {
      code: `test.skip("i need to write this test", () => {});`,
      errors: [{ messageId: 'todoOverEmpty' }],
      output: 'test.todo("i need to write this test");',
    },
    {
      code: `test.skip("i need to write this test", function() {});`,
      errors: [{ messageId: 'todoOverEmpty' }],
      output: 'test.todo("i need to write this test");',
    },
  ],
});
