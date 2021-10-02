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
  isIdentifier,
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

type StartingStatementNode = TSESTree.Statement & {
  parent: TSESTree.BlockStatement;
};

const findStartingStatementInTestBody = (
  node: PromiseChainCallExpression,
): StartingStatementNode | null => {
  let { parent } = node;

  while (parent) {
    if (parent.parent && parent.parent.type === AST_NODE_TYPES.BlockStatement) {
      if (
        parent.parent.parent?.parent?.type === AST_NODE_TYPES.CallExpression &&
        isTestCaseCall(parent.parent.parent?.parent)
      ) {
        return parent as StartingStatementNode;
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

const getVariableName = (
  variable: TSESTree.VariableDeclarator,
): string | null => {
  if (isIdentifier(variable.id)) {
    return variable.id.name;
  }

  return null;
};

const isVariableAwaitedOrReturned = (
  variables: TSESTree.VariableDeclaration & { parent: TSESTree.BlockStatement },
): boolean => {
  const { body } = variables.parent;
  const [variable] = variables.declarations;
  const name = getVariableName(variable);

  if (variable.init?.type === AST_NODE_TYPES.AwaitExpression) {
    return true;
  }

  // null means that the variable is destructured, which is pretty much impossible
  // for us to track, so we return true to bailout gracefully
  if (name === null) {
    return true;
  }

  for (const node of body) {
    if (
      node.type === AST_NODE_TYPES.ReturnStatement &&
      node.argument?.type === AST_NODE_TYPES.Identifier
    ) {
      return isIdentifier(node.argument, name);
    }

    if (
      node.type === AST_NODE_TYPES.ExpressionStatement &&
      node.expression.type === AST_NODE_TYPES.AwaitExpression &&
      node.expression.argument?.type === AST_NODE_TYPES.Identifier
    ) {
      return isIdentifier(node.expression.argument, name);
    }
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
    const chains: boolean[] = [];

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (isTestCaseCallWithCallbackArg(node)) {
          inTestCaseWithDoneCallback = true;

          return;
        }

        if (isPromiseChainCall(node)) {
          chains.unshift(false);

          return;
        }

        if (chains.length === 0) {
          return;
        }

        if (isExpectCall(node)) {
          chains[0] = true;

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

        if (!isPromiseChainCall(node) || !chains.shift()) {
          return;
        }

        const topNode = findStartingStatementInTestBody(node);

        if (!topNode) {
          return;
        }

        if (
          topNode.type === AST_NODE_TYPES.VariableDeclaration &&
          isVariableAwaitedOrReturned(topNode)
        ) {
          return;
        }

        if (
          topNode.type === AST_NODE_TYPES.ReturnStatement ||
          (topNode.type === AST_NODE_TYPES.ExpressionStatement &&
            topNode.expression.type === AST_NODE_TYPES.AwaitExpression)
        ) {
          return;
        }

        reportReturnRequired(context, topNode);
      },
    };
  },
});
