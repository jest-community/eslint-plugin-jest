import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../no-commented-out-tests';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
});

ruleTester.run('no-commented-out-tests', rule, {
  valid: [
    '// foo("bar", function () {})',
    'describe("foo", function () {})',
    'it("foo", function () {})',
    'describe.only("foo", function () {})',
    'it.only("foo", function () {})',
    'it.concurrent("foo", function () {})',
    'test("foo", function () {})',
    'test.only("foo", function () {})',
    'test.concurrent("foo", function () {})',
    'var appliedSkip = describe.skip; appliedSkip.apply(describe)',
    'var calledSkip = it.skip; calledSkip.call(it)',
    '({ f: function () {} }).f()',
    '(a || b).f()',
    'itHappensToStartWithIt()',
    'testSomething()',
    '// latest(dates)',
    '// TODO: unify with Git implementation from Shipit (?)',
    '#!/usr/bin/env node',
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
  ],

  invalid: [
    {
      code: '// describe("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// describe["skip"]("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// describe[\'skip\']("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// it.skip("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// it.only("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// it.concurrent("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// it["skip"]("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// test.skip("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// test.concurrent("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// test["skip"]("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// xdescribe("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// xit("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// fit("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// xtest("foo", function () {})',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: dedent`
        // test(
        //   "foo", function () {}
        // )
      `,
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: dedent`
        /* test
          (
            "foo", function () {}
          )
        */
      `,
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// it("has title but no callback")',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// it()',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// test.someNewMethodThatMightBeAddedInTheFuture()',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// test["someNewMethodThatMightBeAddedInTheFuture"]()',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: '// test("has title but no callback")',
      errors: [{ messageId: 'commentedTests', column: 1, line: 1 }],
    },
    {
      code: dedent`
        foo()
        /*
          describe("has title but no callback", () => {})
        */
        bar()
      `,
      errors: [{ messageId: 'commentedTests', column: 1, line: 2 }],
    },
  ],
});
