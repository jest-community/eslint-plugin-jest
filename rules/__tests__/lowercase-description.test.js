'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../..').rules;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

const errMessage =
  'it(), test() and describe() descriptions should begin with lowercase';
const errors = [{ message: errMessage, column: 1, line: 1 }];

ruleTester.run('lowercase-description', rules['lowercase-description'], {
  valid: [
    "it(' ', function () {})",
    'it(" ", function () {})',
    'it(` `, function () {})',
    "it('foo', function () {})",
    'it("foo", function () {})',
    'it(`foo`, function () {})',
    'it("<Foo/>", function () {})',
    'it("123 foo", function () {})',
    'it(42, function () {})',
    "test('foo', function () {})",
    'test("foo", function () {})',
    'test(`foo`, function () {})',
    'test("<Foo/>", function () {})',
    'test("123 foo", function () {})',
    'test("42", function () {})',
    "describe('foo', function () {})",
    'describe("foo", function () {})',
    'describe(`foo`, function () {})',
    'describe("<Foo/>", function () {})',
    'describe("123 foo", function () {})',
    'describe("42", function () {})',
  ],

  invalid: [
    {
      code: "it('Foo', function () {})",
      errors,
    },
    {
      code: 'it("Foo", function () {})',
      errors,
    },
    {
      code: 'it(`Foo`, function () {})',
      errors,
    },
    {
      code: "test('Foo', function () {})",
      errors,
    },
    {
      code: 'test("Foo", function () {})',
      errors,
    },
    {
      code: 'test(`Foo`, function () {})',
      errors,
    },
    {
      code: "describe('Foo', function () {})",
      errors,
    },
    {
      code: 'describe("Foo", function () {})',
      errors,
    },
    {
      code: 'describe(`Foo`, function () {})',
      errors,
    },
  ],
});
