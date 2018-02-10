'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../..').rules;
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('always-test-or-it', rules['always-test-or-it'], {
  valid: [
    {
      code: 'test("foo")',
      options: ['test'],
    },
    {
      code: 'test.only("foo")',
      options: ['test'],
    },
    {
      code: 'test.skip("foo")',
      options: ['test'],
    },
    {
      code: 'xtest("foo")',
      options: ['test'],
    },
    {
      code: 'it("foo")',
      options: ['it'],
    },
    {
      code: 'fit("foo")',
      options: ['it'],
    },
    {
      code: 'xit("foo")',
      options: ['it'],
    },
    {
      code: 'it.only("foo")',
      options: ['it'],
    },
    {
      code: 'it.skip("foo")',
      options: ['it'],
    },
  ],
  invalid: [
    {
      code: 'test("foo")',
      options: ['it'],
      errors: [{ message: "Always use 'it' test names" }],
      output: 'it("foo")',
    },
    {
      code: 'xtest("foo")',
      options: ['it'],
      errors: [{ message: "Always use 'it' test names" }],
      output: 'xit("foo")',
    },
    {
      code: 'test.skip("foo")',
      options: ['it'],
      errors: [{ message: "Always use 'it' test names" }],
      output: 'it.skip("foo")',
    },
    {
      code: 'test.only("foo")',
      options: ['it'],
      errors: [{ message: "Always use 'it' test names" }],
      output: 'it.only("foo")',
    },
    {
      code: 'it("foo")',
      options: ['test'],
      errors: [{ message: "Always use 'test' test names" }],
      output: 'test("foo")',
    },
    {
      code: 'xit("foo")',
      options: ['test'],
      errors: [{ message: "Always use 'test' test names" }],
      output: 'xtest("foo")',
    },
    {
      code: 'fit("foo")',
      options: ['test'],
      errors: [{ message: "Always use 'test' test names" }],
      output: null,
    },
    {
      code: 'it.skip("foo")',
      options: ['test'],
      errors: [{ message: "Always use 'test' test names" }],
      output: 'test.skip("foo")',
    },
    {
      code: 'it.only("foo")',
      options: ['test'],
      errors: [{ message: "Always use 'test' test names" }],
      output: 'test.only("foo")',
    },
  ],
});
