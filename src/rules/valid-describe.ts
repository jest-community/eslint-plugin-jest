import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  FunctionExpression,
  createRule,
  isDescribe,
  isFunction,
  isSupportedAccessor,
} from './tsUtils';

const isAsync = (node: FunctionExpression): boolean => node.async;

const isString = (node: TSESTree.Node): boolean =>
  (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') ||
  node.type === AST_NODE_TYPES.TemplateLiteral;

const hasParams = (node: FunctionExpression): boolean => node.params.length > 0;

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
      description:
        'Using an improper `describe()` callback function can lead to unexpected test errors.',
      category: 'Possible Errors',
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
        const [name] = node.arguments;
        const [, callbackFunction] = node.arguments;
        if (!isString(name)) {
          context.report({
            messageId: 'firstArgumentMustBeName',
            loc: paramsLocation(node.arguments),
          });
        }

        if (!callbackFunction) {
          context.report({
            messageId: 'nameAndCallback',
            loc: paramsLocation(node.arguments),
          });

          return;
        }

        if (!isFunction(callbackFunction)) {
          context.report({
            messageId: 'secondArgumentMustBeFunction',
            loc: paramsLocation(node.arguments),
          });
          return;
        }

        if (isAsync(callbackFunction)) {
          context.report({
            messageId: 'noAsyncDescribeCallback',
            node: callbackFunction,
          });
        }

        if (hasParams(callbackFunction)) {
          context.report({
            messageId: 'unexpectedDescribeArgument',
            loc: paramsLocation(callbackFunction.params),
          });
        }

        if (
          callbackFunction.body &&
          callbackFunction.body.type === AST_NODE_TYPES.BlockStatement
        ) {
          callbackFunction.body.body.forEach(node => {
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
