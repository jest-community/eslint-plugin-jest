import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../consistent-test-it';
import { TestCaseName } from '../utils';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('consistent-test-it with fn=test', rule, {
  valid: [
    {
      code: 'test("foo")',
      options: [{ fn: TestCaseName.test }],
    },
    {
      code: 'test.only("foo")',
      options: [{ fn: TestCaseName.test }],
    },
    {
      code: 'test.skip("foo")',
      options: [{ fn: TestCaseName.test }],
    },
    {
      code: 'test.concurrent("foo")',
      options: [{ fn: TestCaseName.test }],
    },
    {
      code: 'xtest("foo")',
      options: [{ fn: TestCaseName.test }],
    },
    {
      code: 'test.each([])("foo")',
      options: [{ fn: TestCaseName.test }],
    },
    {
      code: 'test.each``("foo")',
      options: [{ fn: TestCaseName.test }],
    },
    {
      code: 'describe("suite", () => { test("foo") })',
      options: [{ fn: TestCaseName.test }],
    },
  ],
  invalid: [
    {
      code: 'it("foo")',
      output: 'test("foo")',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'xit("foo")',
      output: 'xtest("foo")',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'fit("foo")',
      output: 'test.only("foo")',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'it.skip("foo")',
      output: 'test.skip("foo")',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'it.concurrent("foo")',
      output: 'test.concurrent("foo")',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'it.only("foo")',
      output: 'test.only("foo")',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'it.each([])("foo")',
      output: 'test.each([])("foo")',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'it.each``("foo")',
      output: 'test.each``("foo")',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'describe.each``("foo", () => { it.each``("bar") })',
      output: 'describe.each``("foo", () => { test.each``("bar") })',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'describe.each``("foo", () => { test.each``("bar") })',
      output: 'describe.each``("foo", () => { it.each``("bar") })',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: dedent`
        describe.each()("%s", () => {
          test("is valid, but should not be", () => {});

          it("is not valid, but should be", () => {});
        });
      `,
      output: dedent`
        describe.each()("%s", () => {
          it("is valid, but should not be", () => {});

          it("is not valid, but should be", () => {});
        });
      `,
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: dedent`
        describe.only.each()("%s", () => {
          test("is valid, but should not be", () => {});

          it("is not valid, but should be", () => {});
        });
      `,
      output: dedent`
        describe.only.each()("%s", () => {
          it("is valid, but should not be", () => {});

          it("is not valid, but should be", () => {});
        });
      `,
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { it("foo") })',
      output: 'describe("suite", () => { test("foo") })',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
  ],
});

ruleTester.run('consistent-test-it with fn=it', rule, {
  valid: [
    {
      code: 'it("foo")',
      options: [{ fn: TestCaseName.it }],
    },
    {
      code: 'fit("foo")',
      options: [{ fn: TestCaseName.it }],
    },
    {
      code: 'xit("foo")',
      options: [{ fn: TestCaseName.it }],
    },
    {
      code: 'it.only("foo")',
      options: [{ fn: TestCaseName.it }],
    },
    {
      code: 'it.skip("foo")',
      options: [{ fn: TestCaseName.it }],
    },
    {
      code: 'it.concurrent("foo")',
      options: [{ fn: TestCaseName.it }],
    },
    {
      code: 'it.each([])("foo")',
      options: [{ fn: TestCaseName.it }],
    },
    {
      code: 'it.each``("foo")',
      options: [{ fn: TestCaseName.it }],
    },
    {
      code: 'describe("suite", () => { it("foo") })',
      options: [{ fn: TestCaseName.it }],
    },
  ],
  invalid: [
    {
      code: 'test("foo")',
      output: 'it("foo")',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'xtest("foo")',
      output: 'xit("foo")',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'test.skip("foo")',
      output: 'it.skip("foo")',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'test.concurrent("foo")',
      output: 'it.concurrent("foo")',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'test.only("foo")',
      output: 'it.only("foo")',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'test.each([])("foo")',
      output: 'it.each([])("foo")',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'describe.each``("foo", () => { test.each``("bar") })',
      output: 'describe.each``("foo", () => { it.each``("bar") })',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'test.each``("foo")',
      output: 'it.each``("foo")',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { test("foo") })',
      output: 'describe("suite", () => { it("foo") })',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
  ],
});

ruleTester.run('consistent-test-it with fn=test and withinDescribe=it ', rule, {
  valid: [
    {
      code: 'test("foo")',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
    },
    {
      code: 'test.only("foo")',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
    },
    {
      code: 'test.skip("foo")',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
    },
    {
      code: 'test.concurrent("foo")',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
    },
    {
      code: 'xtest("foo")',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
    },
    {
      code: '[1,2,3].forEach(() => { test("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
    },
  ],
  invalid: [
    {
      code: 'describe("suite", () => { test("foo") })',
      output: 'describe("suite", () => { it("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { test.only("foo") })',
      output: 'describe("suite", () => { it.only("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { xtest("foo") })',
      output: 'describe("suite", () => { xit("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { test.skip("foo") })',
      output: 'describe("suite", () => { it.skip("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { test.concurrent("foo") })',
      output: 'describe("suite", () => { it.concurrent("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
  ],
});

ruleTester.run('consistent-test-it with fn=it and withinDescribe=test ', rule, {
  valid: [
    {
      code: 'it("foo")',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
    },
    {
      code: 'it.only("foo")',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
    },
    {
      code: 'it.skip("foo")',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
    },
    {
      code: 'it.concurrent("foo")',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
    },
    {
      code: 'xit("foo")',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
    },
    {
      code: '[1,2,3].forEach(() => { it("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
    },
  ],
  invalid: [
    {
      code: 'describe("suite", () => { it("foo") })',
      output: 'describe("suite", () => { test("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { it.only("foo") })',
      output: 'describe("suite", () => { test.only("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { xit("foo") })',
      output: 'describe("suite", () => { xtest("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { it.skip("foo") })',
      output: 'describe("suite", () => { test.skip("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { it.concurrent("foo") })',
      output: 'describe("suite", () => { test.concurrent("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
  ],
});

ruleTester.run(
  'consistent-test-it with fn=test and withinDescribe=test ',
  rule,
  {
    valid: [
      {
        code: 'describe("suite", () => { test("foo") })',
        options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.test }],
      },
      {
        code: 'test("foo");',
        options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.test }],
      },
    ],
    invalid: [
      {
        code: 'describe("suite", () => { it("foo") })',
        output: 'describe("suite", () => { test("foo") })',
        options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.test }],
        errors: [
          {
            messageId: 'consistentMethodWithinDescribe',
            data: {
              testKeywordWithinDescribe: TestCaseName.test,
              oppositeTestKeyword: TestCaseName.it,
            },
          },
        ],
      },
      {
        code: 'it("foo")',
        output: 'test("foo")',
        options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.test }],
        errors: [
          {
            messageId: 'consistentMethod',
            data: {
              testKeyword: TestCaseName.test,
              oppositeTestKeyword: TestCaseName.it,
            },
          },
        ],
      },
    ],
  },
);

ruleTester.run('consistent-test-it with fn=it and withinDescribe=it ', rule, {
  valid: [
    {
      code: 'describe("suite", () => { it("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.it }],
    },
    {
      code: 'it("foo")',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.it }],
    },
  ],
  invalid: [
    {
      code: 'describe("suite", () => { test("foo") })',
      output: 'describe("suite", () => { it("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
    {
      code: 'test("foo")',
      output: 'it("foo")',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
  ],
});

ruleTester.run('consistent-test-it defaults without config object', rule, {
  valid: [
    {
      code: 'test("foo")',
    },
  ],
  invalid: [
    {
      code: 'describe("suite", () => { test("foo") })',
      output: 'describe("suite", () => { it("foo") })',
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
  ],
});

ruleTester.run('consistent-test-it with withinDescribe=it', rule, {
  valid: [
    {
      code: 'test("foo")',
      options: [{ withinDescribe: TestCaseName.it }],
    },
    {
      code: 'describe("suite", () => { it("foo") })',
      options: [{ withinDescribe: TestCaseName.it }],
    },
  ],
  invalid: [
    {
      code: 'it("foo")',
      output: 'test("foo")',
      options: [{ withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { test("foo") })',
      output: 'describe("suite", () => { it("foo") })',
      options: [{ withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
    },
  ],
});

ruleTester.run('consistent-test-it with withinDescribe=test', rule, {
  valid: [
    {
      code: 'test("foo")',
      options: [{ withinDescribe: TestCaseName.test }],
    },
    {
      code: 'describe("suite", () => { test("foo") })',
      options: [{ withinDescribe: TestCaseName.test }],
    },
  ],
  invalid: [
    {
      code: 'it("foo")',
      output: 'test("foo")',
      options: [{ withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethod',
          data: {
            testKeyword: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
    {
      code: 'describe("suite", () => { it("foo") })',
      output: 'describe("suite", () => { test("foo") })',
      options: [{ withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithinDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
    },
  ],
});
