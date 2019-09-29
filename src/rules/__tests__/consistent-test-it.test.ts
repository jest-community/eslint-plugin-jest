import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../consistent-test-it';
import { TestCaseName } from '../utils';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 6,
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
      code: 'xtest("foo")',
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
      output: 'test("foo")',
    },
    {
      code: 'xit("foo")',
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
      output: 'xtest("foo")',
    },
    {
      code: 'fit("foo")',
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
      output: 'test.only("foo")',
    },
    {
      code: 'it.skip("foo")',
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
      output: 'test.skip("foo")',
    },
    {
      code: 'it.only("foo")',
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
      output: 'test.only("foo")',
    },
    {
      code: 'describe("suite", () => { it("foo") })',
      options: [{ fn: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
      output: 'describe("suite", () => { test("foo") })',
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
      code: 'describe("suite", () => { it("foo") })',
      options: [{ fn: TestCaseName.it }],
    },
  ],
  invalid: [
    {
      code: 'test("foo")',
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
      output: 'it("foo")',
    },
    {
      code: 'xtest("foo")',
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
      output: 'xit("foo")',
    },
    {
      code: 'test.skip("foo")',
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
      output: 'it.skip("foo")',
    },
    {
      code: 'test.only("foo")',
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
      output: 'it.only("foo")',
    },
    {
      code: 'describe("suite", () => { test("foo") })',
      options: [{ fn: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
      output: 'describe("suite", () => { it("foo") })',
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
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
      output: 'describe("suite", () => { it("foo") })',
    },
    {
      code: 'describe("suite", () => { test.only("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
      output: 'describe("suite", () => { it.only("foo") })',
    },
    {
      code: 'describe("suite", () => { xtest("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
      output: 'describe("suite", () => { xit("foo") })',
    },
    {
      code: 'describe("suite", () => { test.skip("foo") })',
      options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
      output: 'describe("suite", () => { it.skip("foo") })',
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
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
      output: 'describe("suite", () => { test("foo") })',
    },
    {
      code: 'describe("suite", () => { it.only("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
      output: 'describe("suite", () => { test.only("foo") })',
    },
    {
      code: 'describe("suite", () => { xit("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
      output: 'describe("suite", () => { xtest("foo") })',
    },
    {
      code: 'describe("suite", () => { it.skip("foo") })',
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
      output: 'describe("suite", () => { test.skip("foo") })',
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
        options: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.test }],
        errors: [
          {
            messageId: 'consistentMethodWithingDescribe',
            data: {
              testKeywordWithinDescribe: TestCaseName.test,
              oppositeTestKeyword: TestCaseName.it,
            },
          },
        ],
        output: 'describe("suite", () => { test("foo") })',
      },
      {
        code: 'it("foo")',
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
        output: 'test("foo")',
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
      options: [{ fn: TestCaseName.it, withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
      output: 'describe("suite", () => { it("foo") })',
    },
    {
      code: 'test("foo")',
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
      output: 'it("foo")',
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
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
      output: 'describe("suite", () => { it("foo") })',
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
      output: 'test("foo")',
    },
    {
      code: 'describe("suite", () => { test("foo") })',
      options: [{ withinDescribe: TestCaseName.it }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.it,
            oppositeTestKeyword: TestCaseName.test,
          },
        },
      ],
      output: 'describe("suite", () => { it("foo") })',
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
      output: 'test("foo")',
    },
    {
      code: 'describe("suite", () => { it("foo") })',
      options: [{ withinDescribe: TestCaseName.test }],
      errors: [
        {
          messageId: 'consistentMethodWithingDescribe',
          data: {
            testKeywordWithinDescribe: TestCaseName.test,
            oppositeTestKeyword: TestCaseName.it,
          },
        },
      ],
      output: 'describe("suite", () => { test("foo") })',
    },
  ],
});
