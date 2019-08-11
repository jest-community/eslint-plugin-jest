import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  isDescribe,
  isFunction,
  isStringNode,
  isSupportedAccessor,
} from './tsUtils';

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

const isDescribeEach = (node: TSESTree.CallExpression) =>
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  isSupportedAccessor(node.callee.property, 'each');

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description:
        'Using an improper `describe()` callback function can lead to unexpected test errors.',
      recommended: 'warn',
    },
    messages: {
      nameAndCallback: 'Describe requires name and callback arguments',
      firstArgumentMustBeName: 'First argument must be name',
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
        if (!isDescribe(node) || isDescribeEach(node)) {
          return;
        }

        if (node.arguments.length === 0) {
          return context.report({
            messageId: 'nameAndCallback',
            loc: node.loc,
          });
        }

        const [name, callback] = node.arguments;

        if (!isStringNode(name)) {
          context.report({
            messageId: 'firstArgumentMustBeName',
            loc: paramsLocation(node.arguments),
          });
        }

        if (!callback) {
          context.report({
            messageId: 'nameAndCallback',
            loc: paramsLocation(node.arguments),
          });

          return;
        }

        if (!isFunction(callback)) {
          context.report({
            messageId: 'secondArgumentMustBeFunction',
            loc: paramsLocation(node.arguments),
          });

          return;
        }

        if (callback.async) {
          context.report({
            messageId: 'noAsyncDescribeCallback',
            node: callback,
          });
        }

        if (callback.params.length) {
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
