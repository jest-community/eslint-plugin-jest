import dedent from 'dedent';
import rule from '../no-test-prefixes';
import { FlatCompatRuleTester } from './test-utils';

const ruleTester = new FlatCompatRuleTester();

ruleTester.run('no-test-prefixes', rule, {
  valid: [
    'describe("foo", function () {})',
    'it("foo", function () {})',
    'it.concurrent("foo", function () {})',
    'test("foo", function () {})',
    'test.concurrent("foo", function () {})',
    'describe.only("foo", function () {})',
    'it.only("foo", function () {})',
    'it.each()("foo", function () {})',
    {
      code: 'it.each``("foo", function () {})',
      parserOptions: { ecmaVersion: 6 },
    },
    'test.only("foo", function () {})',
    'test.each()("foo", function () {})',
    {
      code: 'test.each``("foo", function () {})',
      parserOptions: { ecmaVersion: 6 },
    },
    'describe.skip("foo", function () {})',
    'it.skip("foo", function () {})',
    'test.skip("foo", function () {})',
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
      code: 'xdescribe.each([])("foo", function () {})',
      output: 'describe.skip.each([])("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'describe.skip.each' },
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
    {
      code: 'xit.each``("foo", function () {})',
      output: 'it.skip.each``("foo", function () {})',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.skip.each' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'xtest.each``("foo", function () {})',
      output: 'test.skip.each``("foo", function () {})',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'test.skip.each' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'xit.each([])("foo", function () {})',
      output: 'it.skip.each([])("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.skip.each' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'xtest.each([])("foo", function () {})',
      output: 'test.skip.each([])("foo", function () {})',
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'test.skip.each' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        import { xit } from '@jest/globals';

        xit("foo", function () {})
      `,
      output: dedent`
        import { xit } from '@jest/globals';

        it.skip("foo", function () {})
      `,
      parserOptions: { sourceType: 'module', ecmaVersion: 2015 },
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.skip' },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { xit as skipThis } from '@jest/globals';

        skipThis("foo", function () {})
      `,
      output: dedent`
        import { xit as skipThis } from '@jest/globals';

        it.skip("foo", function () {})
      `,
      parserOptions: { sourceType: 'module', ecmaVersion: 2015 },
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.skip' },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { fit as onlyThis } from '@jest/globals';

        onlyThis("foo", function () {})
      `,
      output: dedent`
        import { fit as onlyThis } from '@jest/globals';

        it.only("foo", function () {})
      `,
      parserOptions: { sourceType: 'module', ecmaVersion: 2015 },
      errors: [
        {
          messageId: 'usePreferredName',
          data: { preferredNodeName: 'it.only' },
          column: 1,
          line: 3,
        },
      ],
    },
  ],
});
