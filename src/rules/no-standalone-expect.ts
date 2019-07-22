import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { createRule, isTestCase } from './tsUtils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Prevents expects that are outside of an it or test block.',
      recommended: false,
    },
    messages: {
      unexpectedExpect: `Expect must be inside of a test block.`,
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const expectsOut: Array<TSESTree.CallExpression> = [];

    const isExpectCall = (node: TSESTree.Node) => {
      return (
        node &&
        node.type === AST_NODE_TYPES.CallExpression &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'expect'
      );
    };

    return {
      'Program:exit'() {
        if (expectsOut.length > 0) {
          for (const node of expectsOut) {
            context.report({ node, messageId: 'unexpectedExpect' });
          }
        }
      },

      CallExpression(node) {
        if (isExpectCall(node)) {
          let foundTestCase = false;
          let { parent } = node;
          while (parent) {
            if (parent.callee && isTestCase(parent)) {
              foundTestCase = true;
              break;
            }
            parent = parent.parent;
          }

          if (!foundTestCase) expectsOut.push(node);
        }
      },
    };
  },
});
