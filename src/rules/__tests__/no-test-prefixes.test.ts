import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-test-prefixes';

const ruleTester = new TSESLint.RuleTester();

ruleTester.run('no-test-prefixes', rule, {
  valid: [
    'describe("foo", function () {})',
    'it("foo", function () {})',
    'it.concurrent("foo", function () {})',
    'test("foo", function () {})',
    'test.concurrent("foo", function () {})',
    'describe.only("foo", function () {})',
    'it.only("foo", function () {})',
    'it.concurrent.only("foo", function () {})',
    'test.only("foo", function () {})',
    'test.concurrent.only("foo", function () {})',
    'describe.skip("foo", function () {})',
    'it.skip("foo", function () {})',
    'it.concurrent.skip("foo", function () {})',
    'test.skip("foo", function () {})',
    'test.concurrent.skip("foo", function () {})',
    'foo()',
    '[1,2,3].forEach()',
  ],
  invalid: [
    {
      code: 'fdescribe("foo", function () {})',
      output: 'describe.only("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'describe.only' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'fit("foo", function () {})',
      output: 'it.only("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.only' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'fit.concurrent("foo", function () {})',
      output: 'it.concurrent.only("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.concurrent.only' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'xdescribe("foo", function () {})',
      output: 'describe.skip("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'describe.skip' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'xit("foo", function () {})',
      output: 'it.skip("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.skip' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'xtest("foo", function () {})',
      output: 'test.skip("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'test.skip' },
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});
