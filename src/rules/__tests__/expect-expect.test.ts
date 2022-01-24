import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../expect-expect';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('expect-expect', rule, {
  valid: [
    'it.todo("will test something eventually")',
    'test.todo("will test something eventually")',
    "['x']();",
    'it("should pass", () => expect(true).toBeDefined())',
    'test("should pass", () => expect(true).toBeDefined())',
    'it("should pass", () => somePromise().then(() => expect(true).toBeDefined()))',
    'it("should pass", myTest); function myTest() { expect(true).toBeDefined() }',
    {
      code: dedent`
        test('should pass', () => {
          expect(true).toBeDefined();
          foo(true).toBe(true);
        });
      `,
      options: [{ assertFunctionNames: ['expect', 'foo'] }],
    },
    {
      code: 'it("should return undefined",() => expectSaga(mySaga).returns());',
      options: [{ assertFunctionNames: ['expectSaga'] }],
    },
    {
      code: "test('verifies expect method call', () => expect$(123));",
      options: [{ assertFunctionNames: ['expect\\$'] }],
    },
    {
      code: "test('verifies expect method call', () => new Foo().expect(123));",
      options: [{ assertFunctionNames: ['Foo.expect'] }],
    },
    {
      code: dedent`
        test('verifies deep expect method call', () => {
          tester.foo().expect(123);
        });
      `,
      options: [{ assertFunctionNames: ['tester.foo.expect'] }],
    },
    {
      code: dedent`
        test('verifies chained expect method call', () => {
          tester
            .foo()
            .bar()
            .expect(456);
        });
      `,
      options: [{ assertFunctionNames: ['tester.foo.bar.expect'] }],
    },
    {
      code: dedent`
        test("verifies the function call", () => {
          td.verify(someFunctionCall())
        })
      `,
      options: [{ assertFunctionNames: ['td.verify'] }],
    },
    {
      code: 'it("should pass", () => expect(true).toBeDefined())',
      options: [
        {
          assertFunctionNames: undefined,
          additionalTestBlockFunctions: undefined,
        },
      ],
    },
    {
      code: dedent`
        theoretically('the number {input} is correctly translated to string', theories, theory => {
          const output = NumberToLongString(theory.input);
          expect(output).toBe(theory.expected);
        })
      `,
      options: [{ additionalTestBlockFunctions: ['theoretically'] }],
    },
  ],

  invalid: [
    {
      code: 'it("should fail", () => {});',
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'it("should fail", myTest); function myTest() {}',
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'test("should fail", () => {});',
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'test.skip("should fail", () => {});',
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'afterEach(() => {});',
      options: [{ additionalTestBlockFunctions: ['afterEach'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: dedent`
        theoretically('the number {input} is correctly translated to string', theories, theory => {
          const output = NumberToLongString(theory.input);
        })
      `,
      options: [{ additionalTestBlockFunctions: ['theoretically'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'it("should fail", () => { somePromise.then(() => {}); });',
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'test("should fail", () => { foo(true).toBe(true); })',
      options: [{ assertFunctionNames: ['expect'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'it("should also fail",() => expectSaga(mySaga).returns());',
      options: [{ assertFunctionNames: ['expect'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
  ],
});

// {
//   code: `test('wildcard chained function', () => tester.foo().expect(123));`,
//   options: [{ assertFunctionNames: ['tester.*.expect'] }],
// },

ruleTester.run('wildcards', rule, {
  valid: [
    {
      code: "test('should pass', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['tester.*.expect'] }],
    },
    {
      code: "test('should pass **', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['**'] }],
    },
    {
      code: "test('should pass *', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['*'] }],
    },
    {
      code: "test('should pass', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['tester.**'] }],
    },
    {
      code: "test('should pass', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['tester.*'] }],
    },
    {
      code: "test('should pass', () => tester.foo().bar().expectIt(456));",
      options: [{ assertFunctionNames: ['tester.**.expect*'] }],
    },
    {
      code: "test('should pass', () => request.get().foo().expect(456));",
      options: [{ assertFunctionNames: ['request.**.expect'] }],
    },
    {
      code: "test('should pass', () => request.get().foo().expect(456));",
      options: [{ assertFunctionNames: ['request.**.e*e*t'] }],
    },
  ],
  invalid: [
    {
      code: "test('should fail', () => request.get().foo().expect(456));",
      options: [{ assertFunctionNames: ['request.*.expect'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: "test('should fail', () => request.get().foo().bar().expect(456));",
      options: [{ assertFunctionNames: ['request.foo**.expect'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: "test('should fail', () => tester.request(123));",
      options: [{ assertFunctionNames: ['request.*'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: "test('should fail', () => request(123));",
      options: [{ assertFunctionNames: ['request.*'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: "test('should fail', () => request(123));",
      options: [{ assertFunctionNames: ['request.**'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
  ],
});
