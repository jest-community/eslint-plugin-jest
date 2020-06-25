/*
 * This implementation is adapted from eslint-plugin-jasmine.
 * MIT license, Remco Haszing.
 */

import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  TestCaseName,
  createRule,
  getNodeName,
  getTestCallExpressionsFromDeclaredVariables,
} from './utils';

/**
 * Checks if node names returned by getNodeName matches any of the given star patterns
 * Pattern examples:
 *   request.*.expect
 *   request.**.expect
 *   request.**.expect*
 */
function matchesAssertFunctionName(
  nodeName: string,
  patterns: readonly string[],
): boolean {
  return patterns.some(p =>
    new RegExp(
      `^${p
        .split('.')
        .map(x => {
          if (x === '**') return '[a-z\\.]*';

          return x.replace(/\*/gu, '[a-z]*');
        })
        .join('\\.')}(\\.|$)`,
      'ui',
    ).test(nodeName),
  );
}

export default createRule<
  [Partial<{ assertFunctionNames: readonly string[] }>],
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
        } else if (
          name &&
          matchesAssertFunctionName(name, assertFunctionNames)
        ) {
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
