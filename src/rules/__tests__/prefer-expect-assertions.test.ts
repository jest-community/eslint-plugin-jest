import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../prefer-expect-assertions';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-expect-assertions', rule, {
  invalid: [
    {
      code: 'it("it1", () => {})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: 'it("it1", () => {expect.hasAssertions();})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", () => {expect.assertions();})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", () => { foo()})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: 'it("it1", () => { expect.hasAssertions();foo()})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", () => { expect.assertions();foo()})',
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", function() {
          someFunctionToDo();
          someFunctionToDo2();
        })
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("it1", function() {
                  expect.hasAssertions();someFunctionToDo();
                  someFunctionToDo2();
                })
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", function() {
                  expect.assertions();someFunctionToDo();
                  someFunctionToDo2();
                })
              `,
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {var a = 2;})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output:
                'it("it1", function() {expect.hasAssertions();var a = 2;})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", function() {expect.assertions();var a = 2;})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions();})',
      errors: [
        {
          messageId: 'assertionsRequiresOneArgument',
          column: 30,
          line: 1,
          suggestions: [],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions(1,2);})',
      errors: [
        {
          messageId: 'assertionsRequiresOneArgument',
          column: 43,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.assertions(1);})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions("1");})',
      errors: [
        {
          messageId: 'assertionsRequiresNumberArgument',
          column: 41,
          line: 1,
          suggestions: [],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.hasAssertions("1");})',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 30,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.hasAssertions();})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.hasAssertions("1", "2");})',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 30,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.hasAssertions();})',
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", function() {
          expect.hasAssertions(() => {
            someFunctionToDo();
            someFunctionToDo2();
          });
        })
      `,
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 10,
          line: 2,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: dedent`
                it("it1", function() {
                  expect.hasAssertions();
                })
              `,
            },
          ],
        },
      ],
    },
  ],

  valid: [
    {
      code: 'test("it1", () => {expect.assertions(0);})',
    },
    'test("it1", function() {expect.assertions(0);})',
    'test("it1", function() {expect.hasAssertions();})',
    'it("it1", function() {expect.assertions(0);})',
    `
      it("it1", function() {
        expect.assertions(1);
        expect(someValue).toBe(true)
      })
    `,
    'test("it1")',
    'itHappensToStartWithIt("foo", function() {})',
    'testSomething("bar", function() {})',
  ],
});
