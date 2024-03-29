import dedent from 'dedent';
import rule from '../no-disabled-tests';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
});

ruleTester.run('no-disabled-tests', rule, {
  valid: [
    'describe("foo", function () {})',
    'it("foo", function () {})',
    'describe.only("foo", function () {})',
    'it.only("foo", function () {})',
    'it.each("foo", () => {})',
    'it.concurrent("foo", function () {})',
    'test("foo", function () {})',
    'test.only("foo", function () {})',
    'test.concurrent("foo", function () {})',
    'describe[`${"skip"}`]("foo", function () {})',
    'it.todo("fill this later")',
    'var appliedSkip = describe.skip; appliedSkip.apply(describe)',
    'var calledSkip = it.skip; calledSkip.call(it)',
    '({ f: function () {} }).f()',
    '(a || b).f()',
    'itHappensToStartWithIt()',
    'testSomething()',
    'xitSomethingElse()',
    'xitiViewMap()',
    dedent`
      import { pending } from "actions"

      test("foo", () => {
        expect(pending()).toEqual({})
      })
    `,
    dedent`
      const { pending } = require("actions")

      test("foo", () => {
        expect(pending()).toEqual({})
      })
    `,
    dedent`
      test("foo", () => {
        const pending = getPending()
        expect(pending()).toEqual({})
      })
    `,
    dedent`
      test("foo", () => {
        expect(pending()).toEqual({})
      })

      function pending() {
        return {}
      }
    `,
    {
      code: dedent`
        import { test } from './test-utils';

        test('something');
      `,
      parserOptions: { sourceType: 'module' },
    },
  ],

  invalid: [
    {
      code: 'describe.skip("foo", function () {})',
      errors: [{ messageId: 'disabledSuite', column: 1, line: 1 }],
    },
    {
      code: 'describe.skip.each([1, 2, 3])("%s", (a, b) => {});',
      errors: [{ messageId: 'disabledSuite', column: 1, line: 1 }],
    },
    {
      code: 'xdescribe.each([1, 2, 3])("%s", (a, b) => {});',
      errors: [{ messageId: 'disabledSuite', column: 1, line: 1 }],
    },
    {
      code: 'describe[`skip`]("foo", function () {})',
      errors: [{ messageId: 'disabledSuite', column: 1, line: 1 }],
    },
    {
      code: 'describe["skip"]("foo", function () {})',
      errors: [{ messageId: 'disabledSuite', column: 1, line: 1 }],
    },
    {
      code: 'it.skip("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'it["skip"]("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'test.skip("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'it.skip.each``("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'test.skip.each``("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'it.skip.each([])("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'test.skip.each([])("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'test["skip"]("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'xdescribe("foo", function () {})',
      errors: [{ messageId: 'disabledSuite', column: 1, line: 1 }],
    },
    {
      code: 'xit("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'xtest("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'xit.each``("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'xtest.each``("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'xit.each([])("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'xtest.each([])("foo", function () {})',
      errors: [{ messageId: 'disabledTest', column: 1, line: 1 }],
    },
    {
      code: 'it("has title but no callback")',
      errors: [{ messageId: 'missingFunction', column: 1, line: 1 }],
    },
    {
      code: 'test("has title but no callback")',
      errors: [{ messageId: 'missingFunction', column: 1, line: 1 }],
    },
    {
      code: 'it("contains a call to pending", function () { pending() })',
      errors: [{ messageId: 'pendingTest', column: 48, line: 1 }],
    },
    {
      code: 'pending();',
      errors: [{ messageId: 'pending', column: 1, line: 1 }],
    },
    {
      code: 'describe("contains a call to pending", function () { pending() })',
      errors: [{ messageId: 'pendingSuite', column: 54, line: 1 }],
    },
    {
      code: dedent`
        import { test } from '@jest/globals';

        test('something');
      `,
      parserOptions: { sourceType: 'module' },
      errors: [{ messageId: 'missingFunction', column: 1, line: 3 }],
    },
  ],
});
