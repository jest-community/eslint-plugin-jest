/*
 * This implementation is ported from from eslint-plugin-jasmine.
 * MIT license, Tom Vincent.
 */

import {
  expectCase,
  expectNotRejectsCase,
  expectNotResolvesCase,
  expectRejectsCase,
  expectResolvesCase,
  getDocsUrl,
} from './util';

const expectProperties = ['not', 'resolves', 'rejects'];
const promiseArgumentTypes = ['CallExpression', 'ArrayExpression'];

/**
 * expect statement can have chained matchers.
 * We are looking for the closest CallExpression
 * to find `expect().x.y.z.t()` usage.
 *
 * @Returns CallExpressionNode
 */
const getClosestParentCallExpressionNode = node => {
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
const getPromiseCallExpressionNode = node => {
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
    node.callee.object.name === 'Promise' &&
    node.parent
  ) {
    return node;
  }

  return null;
};

const getParentIfThenified = node => {
  const grandParentNode = node.parent && node.parent.parent;

  if (
    grandParentNode &&
    grandParentNode.type === 'CallExpression' &&
    grandParentNode.callee &&
    grandParentNode.callee.type === 'MemberExpression' &&
    ['then', 'catch'].includes(grandParentNode.callee.property.name) &&
    grandParentNode.parent
  ) {
    // Just in case `then`s are chained look one above.
    return getParentIfThenified(grandParentNode);
  }

  return node;
};

const checkIfValidReturn = (parentCallExpressionNode, allowReturn) => {
  const validParentNodeTypes = ['ArrowFunctionExpression', 'AwaitExpression'];
  if (allowReturn) {
    validParentNodeTypes.push('ReturnStatement');
  }

  return validParentNodeTypes.includes(parentCallExpressionNode.type);
};

const promiseArrayExceptionKey = ({ start, end }) =>
  `${start.line}:${start.column}-${end.line}:${end.column}`;

export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
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
  },
  create(context) {
    // Context state
    const arrayExceptions = {};

    const pushPromiseArrayException = loc => {
      const key = promiseArrayExceptionKey(loc);
      arrayExceptions[key] = true;
    };

    /**
     * Promise method that accepts an array of promises,
     * ( eg. Promise.all), will throw warnings for the each
     * unawaited or non-returned promise. To avoid throwing
     * multiple warnings, we check if there is a warning in
     * the given location.
     */
    const promiseArrayExceptionExists = loc => {
      const key = promiseArrayExceptionKey(loc);
      return !!arrayExceptions[key];
    };

    return {
      CallExpression(node) {
        // checking "expect()" arguments
        if (expectCase(node)) {
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
            let parentProperty = parentNode.property;
            let propertyName = parentProperty.name;
            let grandParent = parentNode.parent;

            // a property is accessed, get the next node
            if (grandParent.type === 'MemberExpression') {
              // a modifier is used, just get the next one
              if (expectProperties.includes(propertyName)) {
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
              parentNode = parentNode.parent;
              parentProperty = parentNode.property;
              propertyName = parentProperty.name;
            }

            // matcher was not called
            if (grandParent.type === 'ExpressionStatement') {
              context.report({
                // For some reason `endColumn` isn't set in tests if `loc` is not
                // added
                loc: parentProperty.loc,
                data: { propertyName },
                messageId: expectProperties.includes(propertyName)
                  ? 'propertyWithoutMatcher'
                  : 'matcherOnPropertyNotCalled',
                node: parentProperty,
              });
            }
          }
        }

        if (
          expectResolvesCase(node) ||
          expectRejectsCase(node) ||
          expectNotResolvesCase(node) ||
          expectNotRejectsCase(node)
        ) {
          let parentNode = getClosestParentCallExpressionNode(node);
          if (parentNode) {
            /**
             * If parent node is an array expression, we'll report the warning,
             * for the array object, not for each individual assertion.
             */
            const isParentArrayExpression =
              parentNode.parent.type === 'ArrayExpression';

            const { options } = context;
            const allowReturn = !options[0] || !options[0].alwaysAwait;
            const orReturned = allowReturn ? ' or returned' : '';
            let messageId = 'asyncMustBeAwaited';

            /**
             * An async assertion can be chained with `then` or `catch` statements.
             * In that case our target CallExpression node is the one with
             * the last `then` or `catch` statement.
             */
            parentNode = getParentIfThenified(parentNode);

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
              // If node is not awaited or returned
              !checkIfValidReturn(parentNode.parent, allowReturn) &&
              // if we didn't warn user already
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
      'CallExpression:exit'(node) {
        if (
          node.callee.name === 'expect' &&
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
};
