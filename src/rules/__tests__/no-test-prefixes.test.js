'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-test-prefixes');

const ruleTester = new RuleTester();

ruleTester.run('no-test-prefixes', rule, {
  valid: [
    'describe("foo", function () {})',
    'it("foo", function () {})',
    'test("foo", function () {})',
    'describe.only("foo", function () {})',
    'it.only("foo", function () {})',
    'test.only("foo", function () {})',
    'describe.skip("foo", function () {})',
    'it.skip("foo", function () {})',
    'test.skip("foo", function () {})',
    'foo()',
  ],
  invalid: [
    {
      code: 'fdescribe("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'describe.only' },
          column: 1,
          line: 1,
        },
      ],
      output: 'describe.only("foo", function () {})',
    },
    {
      code: 'fit("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.only' },
          column: 1,
          line: 1,
        },
      ],
      output: 'it.only("foo", function () {})',
    },
    {
      code: 'xdescribe("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'describe.skip' },
          column: 1,
          line: 1,
        },
      ],
      output: 'describe.skip("foo", function () {})',
    },
    {
      code: 'xit("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.skip' },
          column: 1,
          line: 1,
        },
      ],
      output: 'it.skip("foo", function () {})',
    },
    {
      code: 'xtest("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'test.skip' },
          column: 1,
          line: 1,
        },
      ],
      output: 'test.skip("foo", function () {})',
    },
  ],
});
