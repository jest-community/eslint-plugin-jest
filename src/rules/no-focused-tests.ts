import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  TestCaseName,
  createRule,
  isSupportedAccessor,
} from './utils';

const testFunctions = new Set<string>([
  DescribeAlias.describe,
  TestCaseName.test,
  TestCaseName.it,
]);

const matchesTestFunction = (object: TSESTree.LeftHandSideExpression) =>
  'name' in object &&
  (object.name in TestCaseName || object.name in DescribeAlias);

const isCallToFocusedTestFunction = (object: TSESTree.Identifier) =>
  object.name.startsWith('f') && testFunctions.has(object.name.substring(1));

const isCallToTestOnlyFunction = (callee: TSESTree.MemberExpression) =>
  matchesTestFunction(callee.object) &&
  isSupportedAccessor(callee.property, 'only');

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
      const callee =
        node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
          ? node.callee.tag
          : node.callee;

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
