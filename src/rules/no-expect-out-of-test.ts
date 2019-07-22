import {
    AST_NODE_TYPES,
    TSESTree,
  } from '@typescript-eslint/experimental-utils';
  import { createRule, isExpectCall, isTestCase } from './tsUtils';
  
  export default createRule({
    name: __filename,
    meta: {
      docs: {
        category: 'Best Practices',
        description:
          'Prevents expects that are outside of an it or test block.',
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
      let expectsOut = [];
  
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
            const parent = node.parent;
            while(parent) {
                if (isTestCase(parent)) {
                    foundTestCase = true;
                    break;
                }
            }

            if (!foundTestCase) expectsOut.push(node);
          }
        }
      };
    },
  });
  