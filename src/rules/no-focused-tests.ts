import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  TestCaseName,
  TestCaseProperty,
  createRule,
  isSupportedAccessor,
} from './utils';

const validTestCaseNames = [TestCaseName.test, TestCaseName.it];

const testFunctions = new Set<string>([
  DescribeAlias.describe,
  ...validTestCaseNames,
]);

interface ConcurrentExpression extends TSESTree.MemberExpressionComputedName {
  parent: TSESTree.MemberExpression;
}

const isConcurrentExpression = (
  expression: TSESTree.MemberExpression,
): expression is ConcurrentExpression =>
  isSupportedAccessor(expression.property, TestCaseProperty.concurrent) &&
  !!expression.parent &&
  expression.parent.type === AST_NODE_TYPES.MemberExpression;

const matchesTestFunction = (object: TSESTree.LeftHandSideExpression) =>
  'name' in object &&
  typeof object.name === 'string' &&
  (object.name in TestCaseName || object.name in DescribeAlias);

const isCallToFocusedTestFunction = (object: TSESTree.Identifier) =>
  object.name.startsWith('f') && testFunctions.has(object.name.substring(1));

const isCallToTestOnlyFunction = (callee: TSESTree.MemberExpression) =>
  matchesTestFunction(callee.object) &&
  isSupportedAccessor(
    isConcurrentExpression(callee) ? callee.parent.property : callee.property,
    'only',
  );

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow focused tests',
      recommended: 'error',
      suggestion: true,
    },
    messages: {
      focusedTest: 'Unexpected focused test.',
      suggestRemoveFocus: 'Remove focus from test.',
    },
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
        const calleeObject = callee.object;

        if (
          calleeObject.type === AST_NODE_TYPES.Identifier &&
          isCallToFocusedTestFunction(calleeObject)
        ) {
          context.report({
            messageId: 'focusedTest',
            node: calleeObject,
            suggest: [
              {
                messageId: 'suggestRemoveFocus',
                fix(fixer) {
                  return fixer.removeRange([
                    calleeObject.range[0],
                    calleeObject.range[0] + 1,
                  ]);
                },
              },
            ],
          });

          return;
        }

        if (
          calleeObject.type === AST_NODE_TYPES.MemberExpression &&
          isCallToTestOnlyFunction(calleeObject)
        ) {
          context.report({
            messageId: 'focusedTest',
            node: isConcurrentExpression(calleeObject)
              ? callee.property
              : calleeObject.property,
            suggest: [
              {
                messageId: 'suggestRemoveFocus',
                fix(fixer) {
                  if (
                    calleeObject.property.type === AST_NODE_TYPES.Identifier &&
                    calleeObject.property.name === 'only'
                  ) {
                    return fixer.removeRange([
                      calleeObject.object.range[1],
                      calleeObject.range[1],
                    ]);
                  }

                  return fixer.removeRange([
                    calleeObject.range[1],
                    callee.range[1],
                  ]);
                },
              },
            ],
          });

          return;
        }

        if (isCallToTestOnlyFunction(callee)) {
          context.report({
            messageId: 'focusedTest',
            node: callee.property,
            suggest: [
              {
                messageId: 'suggestRemoveFocus',
                fix(fixer) {
                  return fixer.removeRange([
                    calleeObject.range[1],
                    callee.range[1],
                  ]);
                },
              },
            ],
          });

          return;
        }
      }

      if (
        callee.type === AST_NODE_TYPES.Identifier &&
        isCallToFocusedTestFunction(callee)
      ) {
        context.report({
          messageId: 'focusedTest',
          node: callee,
          suggest: [
            {
              messageId: 'suggestRemoveFocus',
              fix(fixer) {
                return fixer.removeRange([
                  callee.range[0],
                  callee.range[0] + 1,
                ]);
              },
            },
          ],
        });
      }
    },
  }),
});
