import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../lowercase-name';
import { DescribeAlias, TestCaseName, TopCase } from '../utils';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('lowercase-name', rule, {
  valid: [
    'randomFunction()',
    'foo.bar()',
    'it()',
    "it(' ', function () {})",
    'it(" ", function () {})',
    'it(` `, function () {})',
    "it('foo', function () {})",
    'it("foo", function () {})',
    'it(`foo`, function () {})',
    'it("<Foo/>", function () {})',
    'it("123 foo", function () {})',
    'it(42, function () {})',
    'it(``)',
    'it("")',
    'it(42)',
    'test()',
    "test('foo', function () {})",
    'test("foo", function () {})',
    'test(`foo`, function () {})',
    'test("<Foo/>", function () {})',
    'test("123 foo", function () {})',
    'test("42", function () {})',
    'test(``)',
    'test("")',
    'test(42)',
    'describe()',
    "describe('foo', function () {})",
    'describe("foo", function () {})',
    'describe(`foo`, function () {})',
    'describe("<Foo/>", function () {})',
    'describe("123 foo", function () {})',
    'describe("42", function () {})',
    'describe(function () {})',
    'describe(``)',
    'describe("")',
    'describe(42)',
    {
      code: 'describe(42)',
      options: [{ ignore: undefined, allowedPrefixes: undefined }],
    },
  ],

  invalid: [
    {
      code: "it('Foo', function () {})",
      output: "it('foo', function () {})",
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.it },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'it("Foo", function () {})',
      output: 'it("foo", function () {})',
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.it },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'it(`Foo`, function () {})',
      output: 'it(`foo`, function () {})',
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.it },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: "test('Foo', function () {})",
      output: "test('foo', function () {})",
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.test },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'test("Foo", function () {})',
      output: 'test("foo", function () {})',
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.test },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'test(`Foo`, function () {})',
      output: 'test(`foo`, function () {})',
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.test },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: "describe('Foo', function () {})",
      output: "describe('foo', function () {})",
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'describe("Foo", function () {})',
      output: 'describe("foo", function () {})',
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'describe(`Foo`, function () {})',
      output: 'describe(`foo`, function () {})',
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'describe(`Some longer description`, function () {})',
      output: 'describe(`some longer description`, function () {})',
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('lowercase-name with ignore=describe', rule, {
  valid: [
    {
      code: "describe('Foo', function () {})",
      options: [{ ignore: [DescribeAlias.describe] }],
    },
    {
      code: 'describe("Foo", function () {})',
      options: [{ ignore: [DescribeAlias.describe] }],
    },
    {
      code: 'describe(`Foo`, function () {})',
      options: [{ ignore: [DescribeAlias.describe] }],
    },
  ],
  invalid: [],
});

ruleTester.run('lowercase-name with ignore=test', rule, {
  valid: [
    {
      code: "test('Foo', function () {})",
      options: [{ ignore: [TestCaseName.test] }],
    },
    {
      code: 'test("Foo", function () {})',
      options: [{ ignore: [TestCaseName.test] }],
    },
    {
      code: 'test(`Foo`, function () {})',
      options: [{ ignore: [TestCaseName.test] }],
    },
  ],
  invalid: [],
});

ruleTester.run('lowercase-name with ignore=it', rule, {
  valid: [
    {
      code: "it('Foo', function () {})",
      options: [{ ignore: [TestCaseName.it] }],
    },
    {
      code: 'it("Foo", function () {})',
      options: [{ ignore: [TestCaseName.it] }],
    },
    {
      code: 'it(`Foo`, function () {})',
      options: [{ ignore: [TestCaseName.it] }],
    },
  ],
  invalid: [],
})

ruleTester.run('uppercase-name with ignore=top', rule, {
  valid: [
    {
      code: `describe("Foo", () => {
            test("bar", () => {
             some_fn();
           })
        })`,
      options: [{ ignore: [TopCase.top] }],
    },
    {
      code: `describe("Foo", () => {
                 it("bar", () => {
                 some_fn();
                })
         })`,
      options: [{ ignore: [TopCase.top] }],
    },
    {
      code: 'describe(`Foo`, function () {})',
      options: [{ ignore: [TopCase.top] }],
    },
    {
      code: 'test(`Foo`, function () {})',
      options: [{ ignore: [TopCase.top] }],
    },
    {
      code: 'it(`Foo`, function () {})',
      options: [{ ignore: [TopCase.top] }],
    },
    {
      code: `describe('MyFirstClass', () => {});
      describe('MySecondClass', () => {});`,
      options: [{ ignore: [TopCase.top] }],
    },
  ],
  invalid: [
    {
      code:`describe("Xyz abc"){
        test("Cde"){}
      }`,
      output: `describe("Xyz abc"){
        test("cde"){}
      }`,
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 1,
          line: 1,
        },
      ],
    }
  ],
}
               
ruleTester.run('lowercase-name with allowedPrefixes', rule, {
  valid: [
    {
      code: "it('GET /live', function () {})",
      options: [{ allowedPrefixes: ['GET'] }],
    },
    {
      code: 'it("POST /live", function () {})',
      options: [{ allowedPrefixes: ['GET', 'POST'] }],
    },
    {
      code: 'it(`PATCH /live`, function () {})',
      options: [{ allowedPrefixes: ['GET', 'PATCH'] }],
    },
  ],
  invalid: [],
});
