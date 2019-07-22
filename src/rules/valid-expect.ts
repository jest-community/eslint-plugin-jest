/*
 * This implementation is ported from from eslint-plugin-jasmine.
 * MIT license, Tom Vincent.
 */
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

import {
  createRule,
  isExpectCall,
  isExpectNotRejectsCall,
  isExpectNotResolvesCall,
  isExpectRejectsCall,
  isExpectResolvesCall,
} from './tsUtils';

const expectProperties = ['not', 'resolves', 'rejects'];
const promiseArgumentTypes = ['CallExpression', 'ArrayExpression'];

/**
 * expect statement can have chained matchers.
 * We are looking for the closest CallExpression
 * to find `expect().x.y.z.t()` usage.
 *
 * @Returns CallExpressionNode
 */
const getClosestParentCallExpressionNode = (
  node: TSESTree.Node,
): TSESTree.Node | null => {
  if (!node || !node.parent || !node.parent.parent) {
    return null;
  }

  if (node.parent.type === 'CallExpression') {
    return node.parent;
  }
  return getClosestParentCallExpressionNode(node.parent);
};

/**
 * Async assertions might be called in Promise
 * methods like `Promise.x(expect1)` or `Promise.x([expect1, expect2])`.
 * If that's the case, Promise node have to be awaited or returned.
 *
 * @Returns CallExpressionNode
 */
const getPromiseCallExpressionNode = (
  node: TSESTree.Node,
): TSESTree.Node | null => {
  if (
    node &&
    node.type === 'ArrayExpression' &&
    node.parent &&
    node.parent.type === 'CallExpression'
  ) {
    node = node.parent;
  }

  if (
    node.type === 'CallExpression' &&
    node.callee &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === AST_NODE_TYPES.Identifier &&
    node.callee.object.name === 'Promise' &&
    node.parent
  ) {
    return node;
  }

  return null;
};

const checkIfValidReturn = (
  parentCallExpressionNode: TSESTree.Node,
  allowReturn: boolean,
) => {
  const validParentNodeTypes = [
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.AwaitExpression,
  ];
  if (allowReturn) {
    validParentNodeTypes.push(AST_NODE_TYPES.ReturnStatement);
  }

  return validParentNodeTypes.includes(parentCallExpressionNode.type);
};

const promiseArrayExceptionKey = ({ start, end }: TSESTree.SourceLocation) =>
  `${start.line}:${start.column}-${end.line}:${end.column}`;

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure expect() is called with a single argument and there is an actual expectation made.',
      category: 'Possible Errors',
      recommended: 'error',
    },
    messages: {
      multipleArgs: 'More than one argument was passed to expect().',
      noArgs: 'No arguments were passed to expect().',
      noAssertions: 'No assertion was called on expect().',
      invalidProperty:
        '"{{ propertyName }}" is not a valid property of expect.',
      propertyWithoutMatcher: '"{{ propertyName }}" needs to call a matcher.',
      matcherOnPropertyNotCalled: '"{{ propertyName }}" was not called.',
      asyncMustBeAwaited: 'Async assertions must be awaited{{ orReturned }}.',
      promisesWithAsyncAssertionsMustBeAwaited:
        'Promises which return async assertions must be awaited{{ orReturned }}.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          alwaysAwait: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  } as const,
  defaultOptions: [
    {
      alwaysAwait: false,
    },
  ],
  create(context) {
    // Context state
    const arrayExceptions: { [key: string]: boolean } = {};

    const pushPromiseArrayException = (loc: TSESTree.SourceLocation) => {
      const key = promiseArrayExceptionKey(loc);
      arrayExceptions[key] = true;
    };

    const promiseArrayExceptionExists = (loc: TSESTree.SourceLocation) => {
      const key = promiseArrayExceptionKey(loc);
      return !!arrayExceptions[key];
    };

    return {
      CallExpression(node) {
        // checking "expect()" arguments
        if (isExpectCall(node)) {
          if (node.arguments.length > 1) {
            const secondArgumentLocStart = node.arguments[1].loc.start;
            const lastArgumentLocEnd =
              node.arguments[node.arguments.length - 1].loc.end;

            context.report({
              loc: {
                end: {
                  column: lastArgumentLocEnd.column - 1,
                  line: lastArgumentLocEnd.line,
                },
                start: secondArgumentLocStart,
              },
              messageId: 'multipleArgs',
              node,
            });
          } else if (node.arguments.length === 0) {
            const expectLength = node.callee.name.length;
            context.report({
              loc: {
                end: {
                  column: node.loc.start.column + expectLength + 1,
                  line: node.loc.start.line,
                },
                start: {
                  column: node.loc.start.column + expectLength,
                  line: node.loc.start.line,
                },
              },
              messageId: 'noArgs',
              node,
            });
          }

          // something was called on `expect()`
          if (
            node.parent &&
            node.parent.type === 'MemberExpression' &&
            node.parent.parent
          ) {
            let parentNode = node.parent;
            let parentProperty = parentNode.property as TSESTree.Identifier;
            let propertyName = parentProperty.name;
            let grandParent = parentNode.parent;

            // a property is accessed, get the next node
            if (grandParent && grandParent.type === 'MemberExpression') {
              // a modifier is used, just get the next one
              if (expectProperties.indexOf(propertyName) > -1) {
                grandParent = grandParent.parent;
              } else {
                // only a few properties are allowed
                context.report({
                  // For some reason `endColumn` isn't set in tests if `loc` is
                  // not added
                  loc: parentProperty.loc,
                  messageId: 'invalidProperty',
                  data: { propertyName },
                  node: parentProperty,
                });
              }

              // this next one should be the matcher
              parentNode = parentNode.parent as TSESTree.MemberExpression;
              parentProperty = parentNode.property as TSESTree.Identifier;
              propertyName = parentProperty.name;
            }

            // matcher was not called
            if (grandParent && grandParent.type === 'ExpressionStatement') {
              context.report({
                // For some reason `endColumn` isn't set in tests if `loc` is not
                // added
                loc: parentProperty.loc,
                data: { propertyName },
                messageId:
                  expectProperties.indexOf(propertyName) > -1
                    ? 'propertyWithoutMatcher'
                    : 'matcherOnPropertyNotCalled',
                node: parentProperty,
              });
            }
          }
        }

        if (
          isExpectResolvesCall(node) ||
          isExpectRejectsCall(node) ||
          isExpectNotResolvesCall(node) ||
          isExpectNotRejectsCall(node)
        ) {
          let parentNode = getClosestParentCallExpressionNode(node);
          if (parentNode && parentNode.parent) {
            const { options } = context;
            const allowReturn = !options[0] || !options[0].alwaysAwait;
            const isParentArrayExpression =
              parentNode.parent.type === 'ArrayExpression';
            const orReturned = allowReturn ? ' or returned' : '';
            let messageId = 'asyncMustBeAwaited';

            // Promise.x([expect()]) || Promise.x(expect())
            if (promiseArgumentTypes.includes(parentNode.parent.type)) {
              const promiseNode = getPromiseCallExpressionNode(
                parentNode.parent,
              );

              if (promiseNode) {
                parentNode = promiseNode;
                messageId = 'promisesWithAsyncAssertionsMustBeAwaited';
              }
            }

            if (
              !checkIfValidReturn(
                parentNode.parent as TSESTree.Node,
                allowReturn,
              ) &&
              !promiseArrayExceptionExists(parentNode.loc)
            ) {
              context.report({
                loc: parentNode.loc,
                data: {
                  orReturned,
                },
                messageId,
                node,
              });

              if (isParentArrayExpression) {
                pushPromiseArrayException(parentNode.loc);
              }
            }
          }
        }
      },

      // nothing called on "expect()"
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === 'expect' &&
          node.parent &&
          node.parent.type === 'ExpressionStatement'
        ) {
          context.report({
            // For some reason `endColumn` isn't set in tests if `loc` is not
            // added
            loc: node.loc,
            messageId: 'noAssertions',
            node,
          });
        }
      },
    };
  },
});
