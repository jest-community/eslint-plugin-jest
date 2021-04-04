import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import { createRule, isDescribeCall, isTestCaseCall } from '../utils';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

const rule = createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Fake rule for testing AST guards',
      recommended: false,
    },
    messages: {
      foundDescribeCall: 'found a call to `describe`',
      foundTestCaseCall: 'found a call to a test case',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create: context => ({
    CallExpression(node) {
      const messageId =
        (isDescribeCall(node) && ('foundDescribeCall' as const)) ||
        (isTestCaseCall(node) && ('foundTestCaseCall' as const));

      if (messageId) {
        context.report({
          messageId,
          node,
        });
      }
    },
  }),
});

ruleTester.run('nonexistent methods', rule, {
  valid: [
    'describe.something()',
    'describe.me()',
    'test.me()',
    'it.fails()',
    'context()',
    'context.each``()',
    'context.each()',
    'describe.context()',
    'describe.concurrent()()',
    'describe.concurrent``()',
    'describe.every``()',
  ],
  invalid: [],
});

const itMemberExpressions = [
  'it["concurrent"]["skip"]',
  'it["concurrent"].skip',
  'it.concurrent["skip"]',
  'it.concurrent.skip',

  'it["concurrent"]["only"]',
  'it["concurrent"].only',
  'it.concurrent["only"]',
  'it.concurrent.only',

  'it["skip"]["each"]()',
  'it["skip"].each()',
  'it.skip["each"]()',
  'it.skip.each()',

  'it["skip"]["each"]``',
  'it["skip"].each``',
  'it.skip["each"]``',
  'it.skip.each``',

  'it["only"]["each"]()',
  'it["only"].each()',
  'it.only["each"]()',
  'it.only.each()',

  'it["only"]["each"]``',
  'it["only"].each``',
  'it.only["each"]``',
  'it.only.each``',

  'xit["each"]()',
  'xit.each()',

  'xit["each"]``',
  'xit.each``',

  'fit["each"]()',
  'fit.each()',

  'fit["each"]``',
  'fit.each``',

  'it["skip"]',
  'it.skip',

  'it["only"]',
  'it.only',

  'it["each"]()',
  'it.each()',

  'it["each"]``',
  'it.each``',

  'fit',
  'xit',
  'it',
];

ruleTester.run('it', rule, {
  valid: itMemberExpressions,
  invalid: itMemberExpressions.map(code => ({
    code: `${code}('works', () => {})`,
    errors: [
      {
        messageId: 'foundTestCaseCall' as const,
        data: {},
        column: 1,
        line: 1,
      },
    ],
  })),
});

const testMemberExpressions = [
  'test["concurrent"]["skip"]',
  'test["concurrent"].skip',
  'test.concurrent["skip"]',
  'test.concurrent.skip',

  'test["concurrent"]["only"]',
  'test["concurrent"].only',
  'test.concurrent["only"]',
  'test.concurrent.only',

  'test["skip"]["each"]()',
  'test["skip"].each()',
  'test.skip["each"]()',
  'test.skip.each()',

  'test["skip"]["each"]``',
  'test["skip"].each``',
  'test.skip["each"]``',
  'test.skip.each``',

  'test["only"]["each"]()',
  'test["only"].each()',
  'test.only["each"]()',
  'test.only.each()',

  'test["only"]["each"]``',
  'test["only"].each``',
  'test.only["each"]``',
  'test.only.each``',

  'xtest["each"]()',
  'xtest.each()',

  'xtest["each"]``',
  'xtest.each``',

  'test["skip"]',
  'test.skip',

  'test["only"]',
  'test.only',

  'test["each"]()',
  'test.each()',

  'test["each"]``',
  'test.each``',

  'xtest',
  'test',
];

ruleTester.run('test', rule, {
  valid: testMemberExpressions,
  invalid: testMemberExpressions.map(code => ({
    code: `${code}('works', () => {})`,
    errors: [
      {
        messageId: 'foundTestCaseCall' as const,
        data: {},
        column: 1,
        line: 1,
      },
    ],
  })),
});

const describeMemberExpressions = [
  'describe["skip"]["each"]()',
  'describe["skip"].each()',
  'describe.skip["each"]()',
  'describe.skip.each()',

  'describe["skip"]["each"]``',
  'describe["skip"].each``',
  'describe.skip["each"]``',
  'describe.skip.each``',

  'describe["only"]["each"]()',
  'describe["only"].each()',
  'describe.only["each"]()',
  'describe.only.each()',

  'describe["only"]["each"]``',
  'describe["only"].each``',
  'describe.only["each"]``',
  'describe.only.each``',

  'xdescribe["each"]()',
  'xdescribe.each()',

  'xdescribe["each"]``',
  'xdescribe.each``',

  'fdescribe["each"]()',
  'fdescribe.each()',

  'fdescribe["each"]``',
  'fdescribe.each``',

  'describe["skip"]',
  'describe.skip',

  'describe["only"]',
  'describe.only',

  'describe["each"]()',
  'describe.each()',

  'describe["each"]``',
  'describe.each``',

  'fdescribe',
  'xdescribe',
  'describe',
];

ruleTester.run('describe', rule, {
  valid: describeMemberExpressions,
  invalid: describeMemberExpressions.map(code => ({
    code: `${code}('works', () => {})`,
    errors: [
      {
        messageId: 'foundDescribeCall' as const,
        data: {},
        column: 1,
        line: 1,
      },
    ],
  })),
});
