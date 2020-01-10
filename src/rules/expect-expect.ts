/*
 * This implementation is adapted from eslint-plugin-jasmine.
 * MIT license, Remco Haszing.
 */

import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import micromatch from 'micromatch';
import {
  TestCaseName,
  createRule,
  getNodeName,
  getTestCallExpressionsFromDeclaredVariables,
} from './utils';

export default createRule<
  [Partial<{ assertFunctionNames: readonly string[] }>],
  'noAssertions'
>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce assertion to be made in a test body',
      recommended: false,
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
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [{ assertFunctionNames: ['expect'] }],
  create(context, [{ assertFunctionNames = ['expect'] }]) {
    const unchecked: TSESTree.CallExpression[] = [];

    function checkCallExpressionUsed(nodes: TSESTree.Node[]) {
      for (const node of nodes) {
        const index =
          node.type === AST_NODE_TYPES.CallExpression
            ? unchecked.indexOf(node)
            : -1;

        if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
          const declaredVariables = context.getDeclaredVariables(node);
          const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(
            declaredVariables,
          );

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
        const name = getNodeName(node.callee);
        if (name === TestCaseName.it || name === TestCaseName.test) {
          unchecked.push(node);
        } else if (name && micromatch.isMatch(name, assertFunctionNames)) {
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
