import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getJestFunctionArguments,
  isDescribe,
  isDescribeEach,
  isFunction,
} from './utils';

const paramsLocation = (
  params: TSESTree.Expression[] | TSESTree.Parameter[],
) => {
  const [first] = params;
  const last = params[params.length - 1];

  return {
    start: first.loc.start,
    end: last.loc.end,
  };
};

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: 'Enforce valid `describe()` callback',
      recommended: 'error',
    },
    messages: {
      nameAndCallback: 'Describe requires name and callback arguments',
      secondArgumentMustBeFunction: 'Second argument must be function',
      noAsyncDescribeCallback: 'No async describe callback',
      unexpectedDescribeArgument: 'Unexpected argument(s) in describe callback',
      unexpectedReturnInDescribe:
        'Unexpected return statement in describe callback',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isDescribe(node)) {
          return;
        }

        const nodeArguments = getJestFunctionArguments(node);

        if (nodeArguments.length < 1) {
          return context.report({
            messageId: 'nameAndCallback',
            loc: node.loc,
          });
        }

        const [, callback] = nodeArguments;

        if (!callback) {
          context.report({
            messageId: 'nameAndCallback',
            loc: paramsLocation(nodeArguments),
          });

          return;
        }

        if (!isFunction(callback)) {
          context.report({
            messageId: 'secondArgumentMustBeFunction',
            loc: paramsLocation(nodeArguments),
          });

          return;
        }

        if (callback.async) {
          context.report({
            messageId: 'noAsyncDescribeCallback',
            node: callback,
          });
        }

        if (!isDescribeEach(node) && callback.params.length) {
          context.report({
            messageId: 'unexpectedDescribeArgument',
            loc: paramsLocation(callback.params),
          });
        }

        if (
          callback.body &&
          callback.body.type === AST_NODE_TYPES.BlockStatement
        ) {
          callback.body.body.forEach(node => {
            if (node.type === AST_NODE_TYPES.ReturnStatement) {
              context.report({
                messageId: 'unexpectedReturnInDescribe',
                node,
              });
            }
          });
        }
      },
    };
  },
});
