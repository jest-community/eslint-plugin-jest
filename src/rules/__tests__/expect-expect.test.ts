import {
  AST_NODE_TYPES,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../expect-expect';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('expect-expect', rule, {
  valid: [
    'it("should pass", () => expect(true).toBeDefined())',
    'test("should pass", () => expect(true).toBeDefined())',
    'it("should pass", () => somePromise().then(() => expect(true).toBeDefined()))',
    'it("should pass", myTest); function myTest() { expect(true).toBeDefined() }',
    {
      code:
        'test("should pass", () => { expect(true).toBeDefined(); foo(true).toBe(true); })',
      options: [{ assertFunctionNames: ['expect', 'foo'] }],
    },
    {
      code: 'it("should return undefined",() => expectSaga(mySaga).returns());',
      options: [{ assertFunctionNames: ['expectSaga'] }],
    },
    {
      code: `test('verifies expect method call', () => new Foo().expect(123));`,
      options: [{ assertFunctionNames: ['Foo.expect'] }],
    },
    {
      code: `test('verifies deep expect method call', () => tester.foo().expect(123));`,
      options: [{ assertFunctionNames: ['tester.foo.expect'] }],
    },
    {
      code: `test('wildcard chained function', () => tester.foo().expect(123));`,
      options: [{ assertFunctionNames: ['tester.*.expect'] }],
    },
    {
      code: `test('verifies recursive expect method call', () => tester.foo().bar().expect(456));`,
      options: [{ assertFunctionNames: ['tester.foo.bar.expect'] }],
    },
    {
      code: `test('verifies recursive expect method call', () => tester.foo().bar().expectIt(456));`,
      options: [{ assertFunctionNames: ['tester.**.expect*'] }],
    },
    {
      code: `test('should pass', () => request.get().foo().expect(456));`,
      options: [{ assertFunctionNames: ['request.**.expect'] }],
    },
    {
      code: `test('should pass', () => request.get().foo().expect(456));`,
      options: [{ assertFunctionNames: ['request.**.e*e*t'] }],
    },
    {
      code: [
        'test("verifies the function call", () => {',
        '  td.verify(someFunctionCall())',
        '})',
      ].join('\n'),
      options: [{ assertFunctionNames: ['td.verify'] }],
    },
    {
      code: 'it("should pass", () => expect(true).toBeDefined())',
      options: [{ assertFunctionNames: undefined }],
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
    {
      code: `test('should fail', () => request.get().foo().expect(456));`,
      options: [{ assertFunctionNames: ['request.*.expect'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: `test('should fail', () => request.get().foo().bar().expect(456));`,
      options: [{ assertFunctionNames: ['tester.foo**.expect'] }],
      errors: [
        {
          messageId: 'noAssertions',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
  ],
});
