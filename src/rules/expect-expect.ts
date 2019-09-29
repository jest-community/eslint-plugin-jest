/*
 * This implementation is adapted from eslint-plugin-jasmine.
 * MIT license, Remco Haszing.
 */

import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, getNodeName } from './utils';

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

    return {
      CallExpression(node) {
        const name = getNodeName(node.callee);
        if (name === 'it' || name === 'test') {
          unchecked.push(node);
        } else if (name && assertFunctionNames.includes(name)) {
          // Return early in case of nested `it` statements.
          for (const ancestor of context.getAncestors()) {
            const index =
              ancestor.type === AST_NODE_TYPES.CallExpression
                ? unchecked.indexOf(ancestor)
                : -1;

            if (index !== -1) {
              unchecked.splice(index, 1);
              break;
            }
          }
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
