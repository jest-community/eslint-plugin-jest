import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../prefer-lowercase-title';
import { DescribeAlias, TestCaseName } from '../utils';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-lowercase-title', rule, {
  valid: [
    'it.each()',
    'it.each()(1)',
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
    dedent`
      describe.each()(1);
      describe.each()(2);
    `,
    'test.for.each()("My Thing")',
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
      code: "xit('Foo', function () {})",
      output: "xit('foo', function () {})",
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.xit },
          column: 5,
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
      code: "xtest('Foo', function () {})",
      output: "xtest('foo', function () {})",
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.xtest },
          column: 7,
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
      code: dedent`
        import { describe as context } from '@jest/globals';

        context(\`Foo\`, () => {});
      `,
      output: dedent`
        import { describe as context } from '@jest/globals';

        context(\`foo\`, () => {});
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 9,
          line: 3,
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
    {
      code: 'fdescribe(`Some longer description`, function () {})',
      output: 'fdescribe(`some longer description`, function () {})',
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.fdescribe },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: "it.each(['green', 'black'])('Should return %', () => {})",
      output: "it.each(['green', 'black'])('should return %', () => {})",
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.it },
          column: 29,
          line: 1,
        },
      ],
    },
    {
      code: "describe.each(['green', 'black'])('Should return %', () => {})",
      output: "describe.each(['green', 'black'])('should return %', () => {})",
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 35,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-lowercase-title with ignore=describe', rule, {
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
    {
      code: 'fdescribe(`Foo`, function () {})',
      options: [{ ignore: [DescribeAlias.describe] }],
    },
    {
      code: 'describe.skip(`Foo`, function () {})',
      options: [{ ignore: [DescribeAlias.describe] }],
    },
  ],
  invalid: [
    {
      code: "test('Foo', function () {})",
      output: "test('foo', function () {})",
      options: [{ ignore: [DescribeAlias.describe] }],
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
      code: "xit('Foo', function () {})",
      output: "xit('foo', function () {})",
      options: [{ ignore: [DescribeAlias.describe] }],
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.xit },
          column: 5,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-lowercase-title with ignore=test', rule, {
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
    {
      code: 'xtest(`Foo`, function () {})',
      options: [{ ignore: [TestCaseName.test] }],
    },
    {
      code: 'test.only(`Foo`, function () {})',
      options: [{ ignore: [TestCaseName.test] }],
    },
  ],
  invalid: [
    {
      code: "describe('Foo', function () {})",
      output: "describe('foo', function () {})",
      options: [{ ignore: [TestCaseName.test] }],
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
      code: "it('Foo', function () {})",
      output: "it('foo', function () {})",
      options: [{ ignore: [TestCaseName.test] }],
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
      code: "xit('Foo', function () {})",
      output: "xit('foo', function () {})",
      options: [{ ignore: [TestCaseName.test] }],
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.xit },
          column: 5,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-lowercase-title with ignore=it', rule, {
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
    {
      code: 'fit(`Foo`, function () {})',
      options: [{ ignore: [TestCaseName.it] }],
    },
    {
      code: 'it.skip(`Foo`, function () {})',
      options: [{ ignore: [TestCaseName.it] }],
    },
  ],
  invalid: [
    {
      code: "describe('Foo', function () {})",
      output: "describe('foo', function () {})",
      options: [{ ignore: [TestCaseName.it] }],
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
      code: "test('Foo', function () {})",
      output: "test('foo', function () {})",
      options: [{ ignore: [TestCaseName.it] }],
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
      code: "xtest('Foo', function () {})",
      output: "xtest('foo', function () {})",
      options: [{ ignore: [TestCaseName.it] }],
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.xtest },
          column: 7,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-lowercase-title with allowedPrefixes', rule, {
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

ruleTester.run('prefer-lowercase-title with ignoreTopLevelDescribe', rule, {
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
        import { describe, describe as context } from '@jest/globals';

        describe('MyClass', () => {
          context('MyMethod', () => {
            it('Does things', () => {
              //
            });
          });
        });
      `,
      output: dedent`
        import { describe, describe as context } from '@jest/globals';

        describe('MyClass', () => {
          context('myMethod', () => {
            it('does things', () => {
              //
            });
          });
        });
      `,
      options: [{ ignoreTopLevelDescribe: true }],
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'unexpectedLowercase',
          data: { method: DescribeAlias.describe },
          column: 11,
          line: 4,
        },
        {
          messageId: 'unexpectedLowercase',
          data: { method: TestCaseName.it },
          column: 8,
          line: 5,
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
