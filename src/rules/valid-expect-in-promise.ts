import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  KnownCallExpression,
  createRule,
  getAccessorValue,
  getNodeName,
  isExpectCall,
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
): node is PromiseChainCallExpression => {
  if (
    node.type === AST_NODE_TYPES.CallExpression &&
    node.callee.type === AST_NODE_TYPES.MemberExpression &&
    isSupportedAccessor(node.callee.property)
  ) {
    // promise methods should have at least 1 argument
    if (node.arguments.length === 0) {
      return false;
    }

    switch (getAccessorValue(node.callee.property)) {
      case 'then':
        return node.arguments.length < 3;
      case 'catch':
      case 'finally':
        return node.arguments.length < 2;
    }
  }

  return false;
};

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

const findTopOfBodyNode = (
  node: PromiseChainCallExpression,
): TSESTree.Statement | null => {
  let { parent } = node;

  while (parent) {
    if (parent.parent && parent.parent.type === AST_NODE_TYPES.BlockStatement) {
      if (
        parent.parent.parent?.parent?.type === AST_NODE_TYPES.CallExpression &&
        isTestCaseCall(parent.parent.parent?.parent)
      ) {
        return parent as TSESTree.Statement;
      }
    }

    parent = parent.parent;
  }

  return null;
};

const isTestCaseCallWithCallbackArg = (
  node: TSESTree.CallExpression,
): boolean => {
  if (!isTestCaseCall(node)) {
    return false;
  }

  const isJestEach = getNodeName(node).endsWith('.each');

  if (
    isJestEach &&
    node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression
  ) {
    // isJestEach but not a TaggedTemplateExpression, so this must be
    // the `jest.each([])()` syntax which this rule doesn't support due
    // to its complexity (see jest-community/eslint-plugin-jest#710)
    // so we return true to trigger bailout
    return true;
  }

  if (isJestEach || node.arguments.length >= 2) {
    const [, callback] = node.arguments;

    const callbackArgIndex = Number(isJestEach);

    return (
      callback &&
      isFunction(callback) &&
      callback.params.length === 1 + callbackArgIndex
    );
  }

  return false;
};

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
    let inTestCaseWithDoneCallback = false;
    let inPromiseChain = false;
    let hasExpectCall = false;

    return {
      CallExpression(node) {
        if (isTestCaseCallWithCallbackArg(node)) {
          inTestCaseWithDoneCallback = true;

          return;
        }

        if (isPromiseChainCall(node)) {
          inPromiseChain = true;

          return;
        }

        if (!inPromiseChain) {
          return;
        }

        if (isExpectCall(node)) {
          hasExpectCall = true;

          return;
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (inTestCaseWithDoneCallback) {
          if (isTestCaseCall(node)) {
            inTestCaseWithDoneCallback = false;
          }

          return;
        }

        if (isPromiseChainCall(node)) {
          inPromiseChain = false;

          if (hasExpectCall) {
            const topNode = findTopOfBodyNode(node);

            if (!topNode) {
              return;
            }
            if (topNode.type !== AST_NODE_TYPES.ReturnStatement) {
              reportReturnRequired(context, topNode);
            }
          }
        }
      },
    };
  },
});
