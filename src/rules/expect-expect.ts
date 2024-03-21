/*
 * This implementation is adapted from eslint-plugin-jasmine.
 * MIT license, Remco Haszing.
 */

import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import {
  createRule,
  getAncestors,
  getDeclaredVariables,
  getNodeName,
  getTestCallExpressionsFromDeclaredVariables,
  isSupportedAccessor,
  isTypeOfJestFnCall,
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
          if (x === '**') {
            return '[a-z\\d\\.]*';
          }

          return x.replace(/\*/gu, '[a-z\\d]*');
        })
        .join('\\.')}(\\.|$)`,
      'ui',
    ).test(nodeName),
  );
}

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
      description: 'Enforce assertion to be made in a test body',
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
          const declaredVariables = getDeclaredVariables(context, node);
          const testCallExpressions =
            getTestCallExpressionsFromDeclaredVariables(
              declaredVariables,
              context,
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
        const name = getNodeName(node.callee) ?? '';

        if (
          isTypeOfJestFnCall(node, context, ['test']) ||
          additionalTestBlockFunctions.includes(name)
        ) {
          if (
            node.callee.type === AST_NODE_TYPES.MemberExpression &&
            isSupportedAccessor(node.callee.property, 'todo')
          ) {
            return;
          }

          unchecked.push(node);
        } else if (matchesAssertFunctionName(name, assertFunctionNames)) {
          // Return early in case of nested `it` statements.
          checkCallExpressionUsed(getAncestors(context, node));
        }
      },
      'Program:exit'() {
        unchecked.forEach(node =>
          context.report({ messageId: 'noAssertions', node: node.callee }),
        );
      },
    };
  },
});
