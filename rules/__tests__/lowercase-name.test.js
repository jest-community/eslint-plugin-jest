'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../lowercase-name');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('lowercase-name', rule, {
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
    'describe(function () {})',
  ],

  invalid: [
    {
      code: "it('Foo', function () {})",
      errors: [
        {
          message: '`it`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'it("Foo", function () {})',
      errors: [
        {
          message: '`it`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'it(`Foo`, function () {})',
      errors: [
        {
          message: '`it`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: "test('Foo', function () {})",
      errors: [
        {
          message: '`test`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'test("Foo", function () {})',
      errors: [
        {
          message: '`test`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'test(`Foo`, function () {})',
      errors: [
        {
          message: '`test`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: "describe('Foo', function () {})",
      errors: [
        {
          message: '`describe`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'describe("Foo", function () {})',
      errors: [
        {
          message: '`describe`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'describe(`Foo`, function () {})',
      errors: [
        {
          message: '`describe`s should begin with lowercase',
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});
