import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  isDescribeCall,
  isFunction,
  isHook,
  isTestCaseCall,
} from './utils';

const shouldBeInHook = (node: TSESTree.Node): boolean => {
  switch (node.type) {
    case AST_NODE_TYPES.ExpressionStatement:
      return shouldBeInHook(node.expression);
    case AST_NODE_TYPES.CallExpression:
      return !(isDescribeCall(node) || isTestCaseCall(node) || isHook(node));

    default:
      return false;
  }
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Require setup and teardown code to be within a hook',
      recommended: false,
    },
    messages: {
      useHook: 'This should be done within a hook',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const checkBlockBody = (body: TSESTree.BlockStatement['body']) => {
      for (const statement of body) {
        if (shouldBeInHook(statement)) {
          context.report({
            node: statement,
            messageId: 'useHook',
          });
        }
      }
    };

    return {
      Program(program) {
        checkBlockBody(program.body);
      },
      CallExpression(node) {
        if (!isDescribeCall(node) || node.arguments.length < 2) {
          return;
        }

        const [, testFn] = node.arguments;

        if (
          !isFunction(testFn) ||
          testFn.body.type !== AST_NODE_TYPES.BlockStatement
        ) {
          return;
        }

        checkBlockBody(testFn.body.body);
      },
    };
  },
});
