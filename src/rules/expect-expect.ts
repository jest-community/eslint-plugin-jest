/*
 * This implementation is adapted from eslint-plugin-jasmine.
 * MIT license, Remco Haszing.
 */

import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getNodeName,
  getTestCallExpressionsFromDeclaredVariables,
  isSupportedAccessor,
  isTestCaseCall,
  matchesFunctionName,
} from './utils';

export default createRule<
  [
    Partial<{
      assertFunctionNames: readonly string[];
      additionalTestBlockFunctions: readonly string[];
    }>,
  ],
  'noAssertions'
>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce assertion to be made in a test body',
      recommended: 'warn',
    },
    messages: {
      noAssertions: 'Test has no assertions',
    },
    schema: [
      {
        type: 'object',
        properties: {
          assertFunctionNames: {
            type: 'array',
            items: [{ type: 'string' }],
          },
          additionalTestBlockFunctions: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [
    { assertFunctionNames: ['expect'], additionalTestBlockFunctions: [] },
  ],
  create(
    context,
    [{ assertFunctionNames = ['expect'], additionalTestBlockFunctions = [] }],
  ) {
    const unchecked: TSESTree.CallExpression[] = [];

    function checkCallExpressionUsed(nodes: TSESTree.Node[]) {
      for (const node of nodes) {
        const index =
          node.type === AST_NODE_TYPES.CallExpression
            ? unchecked.indexOf(node)
            : -1;

        if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
          const declaredVariables = context.getDeclaredVariables(node);
          const testCallExpressions =
            getTestCallExpressionsFromDeclaredVariables(declaredVariables);

          checkCallExpressionUsed(testCallExpressions);
        }

        if (index !== -1) {
          unchecked.splice(index, 1);
          break;
        }
      }
    }

    return {
      CallExpression(node) {
        const name = getNodeName(node.callee) ?? '';

        if (
          isTestCaseCall(node) ||
          matchesFunctionName(name, additionalTestBlockFunctions)
        ) {
          if (
            node.callee.type === AST_NODE_TYPES.MemberExpression &&
            isSupportedAccessor(node.callee.property, 'todo')
          ) {
            return;
          }

          unchecked.push(node);
        } else if (matchesFunctionName(name, assertFunctionNames)) {
          // Return early in case of nested `it` statements.
          checkCallExpressionUsed(context.getAncestors());
        }
      },
      'Program:exit'() {
        unchecked.forEach(node =>
          context.report({ messageId: 'noAssertions', node }),
        );
      },
    };
  },
});
