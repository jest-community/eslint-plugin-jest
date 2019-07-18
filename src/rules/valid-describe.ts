import { createRule, isDescribe, isFunction } from './tsUtils';
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';

type FunctionExpression =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

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
    start: {
      line: first.loc.start.line,
      column: first.loc.start.column,
    },
    end: {
      line: last.loc.end.line,
      column: last.loc.end.column,
    },
  };
};

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
  } as const,
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (isDescribe(node)) {
          if (node.arguments.length === 0) {
            return context.report({
              messageId: 'nameAndCallback',
              loc: node.loc,
            });
          }

          const [name] = node.arguments;
          let [, callbackFunction] = node.arguments;
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
          } else callbackFunction = callbackFunction as FunctionExpression;

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
              if (node.type === 'ReturnStatement') {
                context.report({
                  messageId: 'unexpectedReturnInDescribe',
                  node,
                });
              }
            });
          }
        }
      },
    };
  },
});
