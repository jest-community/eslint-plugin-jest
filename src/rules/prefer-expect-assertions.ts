import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getAccessorValue,
  hasOnlyOneArgument,
  isSupportedAccessor,
} from './utils';

const isExpectAssertionsOrHasAssertionsCall = (expression: TSESTree.Node) => {
  if (
    expression.type !== AST_NODE_TYPES.CallExpression ||
    expression.callee.type !== AST_NODE_TYPES.MemberExpression ||
    !isSupportedAccessor(expression.callee.object, 'expect') ||
    !isSupportedAccessor(expression.callee.property)
  ) {
    return false;
  }

  const expectAssertionName = getAccessorValue(expression.callee.property);

  if (expectAssertionName !== 'assertions') {
    return expectAssertionName === 'hasAssertions';
  }

  const [arg] = expression.arguments;

  return (
    hasOnlyOneArgument(expression) &&
    arg.type === AST_NODE_TYPES.Literal &&
    typeof arg.value === 'number' &&
    Number.isInteger(arg.value)
  );
};

const getFunctionFirstLine = (functionBody: [TSESTree.ExpressionStatement]) =>
  functionBody[0] && functionBody[0].expression;

const isFirstLineExprStmt = (
  functionBody: TSESTree.Statement[],
): functionBody is [TSESTree.ExpressionStatement] =>
  functionBody[0] &&
  functionBody[0].type === AST_NODE_TYPES.ExpressionStatement;

interface PreferExpectAssertionsCallExpression extends TSESTree.CallExpression {
  arguments: [
    TSESTree.Expression,
    TSESTree.ArrowFunctionExpression & { body: TSESTree.BlockStatement },
  ];
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Suggest using `expect.assertions()` OR `expect.hasAssertions()`',
      recommended: false,
    },
    messages: {
      haveExpectAssertions:
        'Every test should have either `expect.assertions(<number of assertions>)` or `expect.hasAssertions()` as its first expression',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'CallExpression[callee.name=/^(it|test)$/][arguments.1.body.body]'(
        node: PreferExpectAssertionsCallExpression,
      ) {
        const testFuncBody = node.arguments[1].body.body;

        if (!isFirstLineExprStmt(testFuncBody)) {
          context.report({ messageId: 'haveExpectAssertions', node });

          return;
        }

        const testFuncFirstLine = getFunctionFirstLine(testFuncBody);
        if (!isExpectAssertionsOrHasAssertionsCall(testFuncFirstLine)) {
          context.report({ messageId: 'haveExpectAssertions', node });
        }
      },
    };
  },
});
