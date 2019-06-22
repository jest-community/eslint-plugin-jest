'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-empty-title');

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
  },
});

ruleTester.run('no-empty-title', rule, {
  valid: [
    'describe()',
    'someFn("", function () {})',
    'describe(1, function () {})',
    'describe("foo", function () {})',
    'describe("foo", function () { it("bar", function () {}) })',
    'test("foo", function () {})',
    'test(`foo`, function () {})',
    'test(`${foo}`, function () {})',
    "it('foo', function () {})",
    "xdescribe('foo', function () {})",
    "xit('foo', function () {})",
    "xtest('foo', function () {})",
  ],
  invalid: [
    {
      code: 'describe("", function () {})',
      errors: [{ messageId: 'describe', column: 1, line: 1 }],
    },
    {
      code: ["describe('foo', () => {", "it('', () => {})", '})'].join('\n'),
      errors: [{ messageId: 'test', column: 1, line: 2 }],
    },
    {
      code: 'it("", function () {})',
      errors: [{ messageId: 'test', column: 1, line: 1 }],
    },
    {
      code: 'test("", function () {})',
      errors: [{ messageId: 'test', column: 1, line: 1 }],
    },
    {
      code: 'test(``, function () {})',
      errors: [{ messageId: 'test', column: 1, line: 1 }],
    },
    {
      code: "xdescribe('', () => {})",
      errors: [{ messageId: 'describe', column: 1, line: 1 }],
    },
    {
      code: "xit('', () => {})",
      errors: [{ messageId: 'test', column: 1, line: 1 }],
    },
    {
      code: "xtest('', () => {})",
      errors: [{ messageId: 'test', column: 1, line: 1 }],
    },
  ],
});
