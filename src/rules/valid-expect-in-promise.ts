import {
  AST_NODE_TYPES,
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

const findTopMostCallExpression = (
  node: TSESTree.CallExpression,
): TSESTree.CallExpression => {
  let topMostCallExpression = node;
  let { parent } = node;

  while (parent) {
    if (parent.type === AST_NODE_TYPES.CallExpression) {
      topMostCallExpression = parent;

      parent = parent.parent;

      continue;
    }

    if (parent.type !== AST_NODE_TYPES.MemberExpression) {
      break;
    }

    parent = parent.parent;
  }

  return topMostCallExpression;
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

const isPromiseMethodThatUsesValue = (
  node: TSESTree.AwaitExpression | TSESTree.ReturnStatement,
  identifier: TSESTree.Identifier,
): boolean => {
  const { name } = identifier;

  if (node.argument === null) {
    return false;
  }

  if (
    node.argument.type === AST_NODE_TYPES.CallExpression &&
    node.argument.arguments.length > 0
  ) {
    const nodeName = getNodeName(node.argument);

    if (nodeName === 'Promise.all') {
      const [firstArg] = node.argument.arguments;

      if (
        firstArg.type === AST_NODE_TYPES.ArrayExpression &&
        firstArg.elements.some(nod => isIdentifier(nod, name))
      ) {
        return true;
      }
    }

    if (
      ['Promise.resolve', 'Promise.reject'].includes(nodeName as string) &&
      node.argument.arguments.length === 1
    ) {
      return isIdentifier(node.argument.arguments[0], name);
    }
  }

  return (
    node.argument.type === AST_NODE_TYPES.Identifier &&
    isIdentifier(node.argument, name)
  );
};

/**
 * Attempts to determine if the runtime value represented by the given `identifier`
 * is `await`ed or `return`ed within the given `body` of statements
 */
const isValueAwaitedOrReturned = (
  identifier: TSESTree.Identifier,
  body: TSESTree.Statement[],
): boolean => {
  const { name } = identifier;

  for (const node of body) {
    // skip all nodes that are before this identifier, because they'd probably
    // be affecting a different runtime value (e.g. due to reassignment)
    if (node.range[0] <= identifier.range[0]) {
      continue;
    }

    if (node.type === AST_NODE_TYPES.ReturnStatement) {
      return isPromiseMethodThatUsesValue(node, identifier);
    }

    if (node.type === AST_NODE_TYPES.ExpressionStatement) {
      if (node.expression.type === AST_NODE_TYPES.AwaitExpression) {
        return isPromiseMethodThatUsesValue(node.expression, identifier);
      }

      // (re)assignment changes the runtime value, so if we've not found an
      // await or return already we act as if we've reached the end of the body
      if (node.expression.type === AST_NODE_TYPES.AssignmentExpression) {
        // unless we're assigning to the same identifier, in which case
        // we might be chaining off the existing promise value
        if (
          isIdentifier(node.expression.left, name) &&
          getNodeName(node.expression.right)?.startsWith(`${name}.`) &&
          isPromiseChainCall(node.expression.right)
        ) {
          continue;
        }

        break;
      }
    }

    if (
      node.type === AST_NODE_TYPES.BlockStatement &&
      isValueAwaitedOrReturned(identifier, node.body)
    ) {
      return true;
    }
  }

  return false;
};

const findFirstBlockBodyUp = (
  node: TSESTree.Node,
): TSESTree.BlockStatement['body'] => {
  let parent: TSESTree.Node['parent'] = node;

  while (parent) {
    if (parent.type === AST_NODE_TYPES.BlockStatement) {
      return parent.body;
    }

    parent = parent.parent;
  }

  /* istanbul ignore next */
  throw new Error(
    `Could not find BlockStatement - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
  );
};

const isDirectlyWithinTestCaseCall = (node: TSESTree.Node): boolean => {
  let parent: TSESTree.Node['parent'] = node;

  while (parent) {
    if (isFunction(parent)) {
      parent = parent.parent;

      return !!(
        parent?.type === AST_NODE_TYPES.CallExpression && isTestCaseCall(parent)
      );
    }

    parent = parent.parent;
  }

  return false;
};

const isVariableAwaitedOrReturned = (
  variable: TSESTree.VariableDeclarator,
): boolean => {
  const body = findFirstBlockBodyUp(variable);

  // it's pretty much impossible for us to track destructuring assignments,
  // so we return true to bailout gracefully
  if (!isIdentifier(variable.id)) {
    return true;
  }

  return isValueAwaitedOrReturned(variable.id, body);
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Ensure promises that have expectations in their chain are valid',
      recommended: 'error',
    },
    messages: {
      expectInFloatingPromise:
        "This promise should either be returned or awaited to ensure the expects in it's chain are called",
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

        if (chains.length > 0 && isExpectCall(node)) {
          chains[0] = true;
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (inTestCaseWithDoneCallback) {
          if (isTestCaseCall(node)) {
            inTestCaseWithDoneCallback = false;
          }

          return;
        }

        if (!isPromiseChainCall(node)) {
          return;
        }

        const hasExpectCall = chains.shift();

        if (!hasExpectCall) {
          return;
        }

        const { parent } = findTopMostCallExpression(node);

        if (!parent || !isDirectlyWithinTestCaseCall(parent)) {
          return;
        }

        switch (parent.type) {
          case AST_NODE_TYPES.VariableDeclarator: {
            if (isVariableAwaitedOrReturned(parent)) {
              return;
            }

            break;
          }

          case AST_NODE_TYPES.AssignmentExpression: {
            if (
              parent.left.type === AST_NODE_TYPES.Identifier &&
              isValueAwaitedOrReturned(
                parent.left,
                findFirstBlockBodyUp(parent),
              )
            ) {
              return;
            }

            break;
          }

          case AST_NODE_TYPES.ExpressionStatement:
            break;

          case AST_NODE_TYPES.ReturnStatement:
          case AST_NODE_TYPES.AwaitExpression:
          default:
            return;
        }

        context.report({
          messageId: 'expectInFloatingPromise',
          node: parent,
        });
      },
    };
  },
});
