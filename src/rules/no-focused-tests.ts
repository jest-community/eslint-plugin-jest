import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { DescribeAlias, TestCaseName, createRule } from './tsUtils';

const testFunctions = new Set(['describe', 'it', 'test']);

const matchesTestFunction = (
  object: TSESTree.LeftHandSideExpression | undefined,
) =>
  object &&
  'name' in object &&
  (object.name in TestCaseName || object.name in DescribeAlias);

const isCallToFocusedTestFunction = (object: TSESTree.Identifier | undefined) =>
  object &&
  object.name.startsWith('f') &&
  testFunctions.has(object.name.substring(1));

const isPropertyNamedOnly = (
  property: TSESTree.Expression | TSESTree.Identifier | undefined,
) =>
  property &&
  (('name' in property && property.name === 'only') ||
    ('value' in property && property.value === 'only'));

const isCallToTestOnlyFunction = (callee: TSESTree.MemberExpression) =>
  matchesTestFunction(callee.object) && isPropertyNamedOnly(callee.property);

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow focused tests',
      recommended: false,
    },
    messages: {
      focusedTest: 'Unexpected focused test.',
    },
    fixable: 'code',
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create: context => ({
    CallExpression(node) {
      const { callee } = node;

      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        if (
          callee.object.type === AST_NODE_TYPES.Identifier &&
          isCallToFocusedTestFunction(callee.object)
        ) {
          context.report({ messageId: 'focusedTest', node: callee.object });
          return;
        }

        if (
          callee.object.type === AST_NODE_TYPES.MemberExpression &&
          isCallToTestOnlyFunction(callee.object)
        ) {
          context.report({
            messageId: 'focusedTest',
            node: callee.object.property,
          });
          return;
        }

        if (isCallToTestOnlyFunction(callee)) {
          context.report({ messageId: 'focusedTest', node: callee.property });
          return;
        }
      }

      if (
        callee.type === AST_NODE_TYPES.Identifier &&
        isCallToFocusedTestFunction(callee)
      ) {
        context.report({ messageId: 'focusedTest', node: callee });
      }
    },
  }),
});
