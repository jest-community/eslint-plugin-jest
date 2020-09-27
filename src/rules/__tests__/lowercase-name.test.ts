import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../lowercase-name';
import { DescribeAlias, TestCaseName } from '../utils';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('lowercase-name', rule, {
  valid: [
    'randomFunction()',
    'foo.bar()',
    'it()',
    "it(' ', function () {})",
    'it(true, function () {})',
    'it(MY_CONSTANT, function () {})',
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
          column: 4,
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
          column: 4,
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
          column: 4,
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
          column: 6,
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
          column: 6,
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
          column: 6,
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
          column: 10,
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
          column: 10,
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
          column: 10,
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
          column: 10,
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
});

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

ruleTester.run('lowercase-name with ignoreTopLevelDescribe', rule, {
  valid: [
    {
      code: 'describe("MyClass", () => {});',
      options: [{ ignoreTopLevelDescribe: true }],
    },
    {
      code: dedent`
        describe('MyClass', () => {
          describe('#myMethod', () => {
            it('does things', () => {
              //
            });
          });
        });
      `,
      options: [{ ignoreTopLevelDescribe: true }],
    },
    {
      code: dedent`
        describe('Strings', () => {
          it('are strings', () => {
            expect('abc').toBe('abc');
          });
        });
        
        describe('Booleans', () => {
          it('are booleans', () => {
            expect(true).toBe(true);
          });
        });
      `,
      options: [{ ignoreTopLevelDescribe: true }],
    },
  ],
  invalid: [
    {
      code: 'it("Works!", () => {});',
      output: 'it("works!", () => {});',
      options: [{ ignoreTopLevelDescribe: true }],
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.it },
          column: 4,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        describe('MyClass', () => {
          describe('MyMethod', () => {
            it('Does things', () => {
              //
            });
          });
        });
      `,
      output: dedent`
        describe('MyClass', () => {
          describe('myMethod', () => {
            it('does things', () => {
              //
            });
          });
        });
      `,
      options: [{ ignoreTopLevelDescribe: true }],
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 12,
          line: 2,
        },
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.it },
          column: 8,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('MyClass', () => {
          describe('MyMethod', () => {
            it('Does things', () => {
              //
            });
          });
        });
      `,
      output: dedent`
        describe('myClass', () => {
          describe('myMethod', () => {
            it('does things', () => {
              //
            });
          });
        });
      `,
      options: [{ ignoreTopLevelDescribe: false }],
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 10,
          line: 1,
        },
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 12,
          line: 2,
        },
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.it },
          column: 8,
          line: 3,
        },
      ],
    },
  ],
});
