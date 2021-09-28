import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  FunctionExpression,
  KnownCallExpression,
  createRule,
  getAccessorValue,
  isExpectMember,
  isFunction,
  isSupportedAccessor,
  isTestCaseCall,
} from './utils';

type MessageIds = 'returnPromise';
type RuleContext = TSESLint.RuleContext<MessageIds, unknown[]>;

type PromiseChainCallExpression = KnownCallExpression<
  'then' | 'catch' | 'finally'
>;

const isPromiseChainCall = (
  node: TSESTree.Node,
): node is PromiseChainCallExpression =>
  node.type === AST_NODE_TYPES.CallExpression &&
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  isSupportedAccessor(node.callee.property) &&
  ['then', 'catch', 'finally'].includes(getAccessorValue(node.callee.property));

const isExpectCallPresentInFunction = (body: TSESTree.Node) => {
  if (body.type === AST_NODE_TYPES.BlockStatement) {
    return body.body.find(line => {
      if (line.type === AST_NODE_TYPES.ExpressionStatement) {
        return isFullExpectCall(line.expression);
      }
      if (line.type === AST_NODE_TYPES.ReturnStatement && line.argument) {
        return isFullExpectCall(line.argument);
      }

      return false;
    });
  }

  return isFullExpectCall(body);
};

const isFullExpectCall = (expression: TSESTree.Node) =>
  expression.type === AST_NODE_TYPES.CallExpression &&
  isExpectMember(expression.callee);

const reportReturnRequired = (context: RuleContext, node: TSESTree.Node) => {
  context.report({
    loc: {
      end: {
        column: node.loc.end.column,
        line: node.loc.end.line,
      },
      start: node.loc.start,
    },
    messageId: 'returnPromise',
    node,
  });
};

const isPromiseReturnedLater = (
  node: TSESTree.Node,
  testFunctionBody: TSESTree.Statement[],
) => {
  let promiseName;

  if (
    node.type === AST_NODE_TYPES.ExpressionStatement &&
    node.expression.type === AST_NODE_TYPES.CallExpression &&
    node.expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    isSupportedAccessor(node.expression.callee.object)
  ) {
    promiseName = getAccessorValue(node.expression.callee.object);
  } else if (
    node.type === AST_NODE_TYPES.VariableDeclarator &&
    node.id.type === AST_NODE_TYPES.Identifier
  ) {
    promiseName = node.id.name;
  }

  const lastLineInTestFunc = testFunctionBody[testFunctionBody.length - 1];

  return (
    lastLineInTestFunc.type === AST_NODE_TYPES.ReturnStatement &&
    lastLineInTestFunc.argument &&
    (('name' in lastLineInTestFunc.argument &&
      lastLineInTestFunc.argument.name === promiseName) ||
      !promiseName)
  );
};

const findTestFunction = (node: TSESTree.Node | undefined) => {
  while (node) {
    if (
      isFunction(node) &&
      node.parent?.type === AST_NODE_TYPES.CallExpression &&
      isTestCaseCall(node.parent)
    ) {
      return node;
    }

    node = node.parent;
  }

  return null;
};

const isParentThenOrPromiseReturned = (
  node: TSESTree.Node,
  testFunctionBody: TSESTree.Statement[],
) =>
  node.type === AST_NODE_TYPES.ReturnStatement ||
  isPromiseReturnedLater(node, testFunctionBody);

const verifyExpectWithReturn = (
  promiseCallbacks: Array<TSESTree.CallExpressionArgument | undefined>,
  node: PromiseChainCallExpression['callee'],
  context: RuleContext,
  testFunctionBody: TSESTree.Statement[],
) => {
  promiseCallbacks.some(promiseCallback => {
    if (promiseCallback && isFunction(promiseCallback)) {
      if (
        isExpectCallPresentInFunction(promiseCallback.body) &&
        node.parent.parent &&
        !isParentThenOrPromiseReturned(node.parent.parent, testFunctionBody)
      ) {
        reportReturnRequired(context, node.parent.parent);

        return true;
      }
    }

    return false;
  });
};

const isHavingAsyncCallBackParam = (testFunction: FunctionExpression) =>
  testFunction.params[0] &&
  testFunction.params[0].type === AST_NODE_TYPES.Identifier;

export default createRule<unknown[], MessageIds>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce having return statement when testing with promises',
      recommended: 'error',
    },
    messages: {
      returnPromise:
        'Promise should be returned to test its fulfillment or rejection',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          !isPromiseChainCall(node) ||
          (node.parent && node.parent.type === AST_NODE_TYPES.AwaitExpression)
        ) {
          return;
        }
        const testFunction = findTestFunction(node);

        if (testFunction && !isHavingAsyncCallBackParam(testFunction)) {
          const { body } = testFunction;

          if (body.type !== AST_NODE_TYPES.BlockStatement) {
            return;
          }

          const testFunctionBody = body.body;

          // then block can have two args, fulfillment & rejection
          // then block can have one args, fulfillment
          // catch block can have one args, rejection
          // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
          verifyExpectWithReturn(
            node.arguments.slice(0, 2),
            node.callee,
            context,
            testFunctionBody,
          );
        }
      },
    };
  },
});
