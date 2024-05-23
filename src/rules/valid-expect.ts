/*
 * This implementation is ported from from eslint-plugin-jasmine.
 * MIT license, Tom Vincent.
 */

import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import type { RuleFix } from '@typescript-eslint/utils/ts-eslint';
import {
  type FunctionExpression,
  ModifierName,
  createRule,
  getAccessorValue,
  getSourceCode,
  isFunction,
  isSupportedAccessor,
  parseJestFnCallWithReason,
} from './utils';

/**
 * Async assertions might be called in Promise
 * methods like `Promise.x(expect1)` or `Promise.x([expect1, expect2])`.
 * If that's the case, Promise node have to be awaited or returned.
 *
 * @Returns CallExpressionNode
 */
const getPromiseCallExpressionNode = (node: TSESTree.Node) => {
  if (
    node.type === AST_NODE_TYPES.ArrayExpression &&
    node.parent &&
    node.parent.type === AST_NODE_TYPES.CallExpression
  ) {
    node = node.parent;
  }

  if (
    node.type === AST_NODE_TYPES.CallExpression &&
    node.callee.type === AST_NODE_TYPES.MemberExpression &&
    isSupportedAccessor(node.callee.object, 'Promise') &&
    node.parent
  ) {
    return node;
  }

  return null;
};

const findPromiseCallExpressionNode = (node: TSESTree.Node) =>
  node.parent?.parent &&
  [AST_NODE_TYPES.CallExpression, AST_NODE_TYPES.ArrayExpression].includes(
    node.parent.type,
  )
    ? getPromiseCallExpressionNode(node.parent)
    : null;

const findFirstFunctionExpression = ({
  parent,
}: TSESTree.Node): FunctionExpression | null => {
  if (!parent) {
    return null;
  }

  return isFunction(parent) ? parent : findFirstFunctionExpression(parent);
};

const getNormalizeFunctionExpression = (
  functionExpression: FunctionExpression,
):
  | TSESTree.PropertyComputedName
  | TSESTree.PropertyNonComputedName
  | FunctionExpression => {
  if (
    functionExpression.parent.type === AST_NODE_TYPES.Property &&
    functionExpression.type === AST_NODE_TYPES.FunctionExpression
  ) {
    return functionExpression.parent;
  }

  return functionExpression;
};

const getParentIfThenified = (node: TSESTree.Node): TSESTree.Node => {
  const grandParentNode = node.parent?.parent;

  if (
    grandParentNode &&
    grandParentNode.type === AST_NODE_TYPES.CallExpression &&
    grandParentNode.callee.type === AST_NODE_TYPES.MemberExpression &&
    isSupportedAccessor(grandParentNode.callee.property) &&
    ['then', 'catch'].includes(
      getAccessorValue(grandParentNode.callee.property),
    ) &&
    grandParentNode.parent
  ) {
    // Just in case `then`s are chained look one above.
    return getParentIfThenified(grandParentNode);
  }

  return node;
};

const isAcceptableReturnNode = (
  node: TSESTree.Node,
  allowReturn: boolean,
): node is
  | TSESTree.ConditionalExpression
  | TSESTree.ArrowFunctionExpression
  | TSESTree.AwaitExpression
  | TSESTree.ReturnStatement => {
  if (allowReturn && node.type === AST_NODE_TYPES.ReturnStatement) {
    return true;
  }

  if (node.type === AST_NODE_TYPES.ConditionalExpression && node.parent) {
    return isAcceptableReturnNode(node.parent, allowReturn);
  }

  return [
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.AwaitExpression,
  ].includes(node.type);
};

const promiseArrayExceptionKey = ({ start, end }: TSESTree.SourceLocation) =>
  `${start.line}:${start.column}-${end.line}:${end.column}`;

interface Options {
  alwaysAwait?: boolean;
  asyncMatchers?: string[];
  minArgs?: number;
  maxArgs?: number;
}

type MessageIds =
  | 'tooManyArgs'
  | 'notEnoughArgs'
  | 'modifierUnknown'
  | 'matcherNotFound'
  | 'matcherNotCalled'
  | 'asyncMustBeAwaited'
  | 'promisesWithAsyncAssertionsMustBeAwaited';

const defaultAsyncMatchers = ['toReject', 'toResolve'];

export default createRule<[Options], MessageIds>({
  name: __filename,
  meta: {
    docs: {
      description: 'Enforce valid `expect()` usage',
    },
    messages: {
      tooManyArgs: 'Expect takes at most {{ amount }} argument{{ s }}',
      notEnoughArgs: 'Expect requires at least {{ amount }} argument{{ s }}',
      modifierUnknown: 'Expect has an unknown modifier',
      matcherNotFound: 'Expect must have a corresponding matcher call',
      matcherNotCalled: 'Matchers must be called to assert',
      asyncMustBeAwaited: 'Async assertions must be awaited{{ orReturned }}',
      promisesWithAsyncAssertionsMustBeAwaited:
        'Promises which return async assertions must be awaited{{ orReturned }}',
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          alwaysAwait: {
            type: 'boolean',
            default: false,
          },
          asyncMatchers: {
            type: 'array',
            items: { type: 'string' },
          },
          minArgs: {
            type: 'number',
            minimum: 1,
          },
          maxArgs: {
            type: 'number',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      alwaysAwait: false,
      asyncMatchers: defaultAsyncMatchers,
      minArgs: 1,
      maxArgs: 1,
    },
  ],
  create(
    context,
    [
      {
        alwaysAwait,
        asyncMatchers = defaultAsyncMatchers,
        minArgs = 1,
        maxArgs = 1,
      },
    ],
  ) {
    // Context state
    const arrayExceptions = new Set<string>();
    const descriptors: Array<{
      node: TSESTree.Node;
      messageId: Extract<
        MessageIds,
        'asyncMustBeAwaited' | 'promisesWithAsyncAssertionsMustBeAwaited'
      >;
    }> = [];

    const pushPromiseArrayException = (loc: TSESTree.SourceLocation) =>
      arrayExceptions.add(promiseArrayExceptionKey(loc));

    /**
     * Promise method that accepts an array of promises,
     * (eg. Promise.all), will throw warnings for the each
     * unawaited or non-returned promise. To avoid throwing
     * multiple warnings, we check if there is a warning in
     * the given location.
     */
    const promiseArrayExceptionExists = (loc: TSESTree.SourceLocation) =>
      arrayExceptions.has(promiseArrayExceptionKey(loc));

    const findTopMostMemberExpression = (
      node: TSESTree.MemberExpression,
    ): TSESTree.MemberExpression => {
      let topMostMemberExpression = node;
      let { parent } = node;

      while (parent) {
        if (parent.type !== AST_NODE_TYPES.MemberExpression) {
          break;
        }

        topMostMemberExpression = parent;
        parent = parent.parent;
      }

      return topMostMemberExpression;
    };

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCallWithReason(node, context);

        if (typeof jestFnCall === 'string') {
          const reportingNode =
            node.parent?.type === AST_NODE_TYPES.MemberExpression
              ? findTopMostMemberExpression(node.parent).property
              : node;

          if (jestFnCall === 'matcher-not-found') {
            context.report({
              messageId: 'matcherNotFound',
              node: reportingNode,
            });

            return;
          }

          if (jestFnCall === 'matcher-not-called') {
            context.report({
              messageId:
                isSupportedAccessor(reportingNode) &&
                ModifierName.hasOwnProperty(getAccessorValue(reportingNode))
                  ? 'matcherNotFound'
                  : 'matcherNotCalled',
              node: reportingNode,
            });
          }

          if (jestFnCall === 'modifier-unknown') {
            context.report({
              messageId: 'modifierUnknown',
              node: reportingNode,
            });

            return;
          }

          return;
        } else if (jestFnCall?.type !== 'expect') {
          return;
        }

        const { parent: expect } = jestFnCall.head.node;

        if (expect?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        if (expect.arguments.length < minArgs) {
          const expectLength = getAccessorValue(jestFnCall.head.node).length;

          const loc: TSESTree.SourceLocation = {
            start: {
              column: expect.loc.start.column + expectLength,
              line: expect.loc.start.line,
            },
            end: {
              column: expect.loc.start.column + expectLength + 1,
              line: expect.loc.start.line,
            },
          };

          context.report({
            messageId: 'notEnoughArgs',
            data: { amount: minArgs, s: minArgs === 1 ? '' : 's' },
            node: expect,
            loc,
          });
        }

        if (expect.arguments.length > maxArgs) {
          const { start } = expect.arguments[maxArgs].loc;
          const { end } = expect.arguments[expect.arguments.length - 1].loc;

          const loc = {
            start,
            end: {
              column: end.column - 1,
              line: end.line,
            },
          };

          context.report({
            messageId: 'tooManyArgs',
            data: { amount: maxArgs, s: maxArgs === 1 ? '' : 's' },
            node: expect,
            loc,
          });
        }

        const { matcher } = jestFnCall;

        const parentNode = matcher.parent.parent;
        const shouldBeAwaited =
          jestFnCall.modifiers.some(nod => getAccessorValue(nod) !== 'not') ||
          asyncMatchers.includes(getAccessorValue(matcher));

        if (!parentNode.parent || !shouldBeAwaited) {
          return;
        }
        /**
         * If parent node is an array expression, we'll report the warning,
         * for the array object, not for each individual assertion.
         */
        const isParentArrayExpression =
          parentNode.parent.type === AST_NODE_TYPES.ArrayExpression;
        /**
         * An async assertion can be chained with `then` or `catch` statements.
         * In that case our target CallExpression node is the one with
         * the last `then` or `catch` statement.
         */
        const targetNode = getParentIfThenified(parentNode);
        const finalNode =
          findPromiseCallExpressionNode(targetNode) || targetNode;

        if (
          finalNode.parent &&
          // If node is not awaited or returned
          !isAcceptableReturnNode(finalNode.parent, !alwaysAwait) &&
          // if we didn't warn user already
          !promiseArrayExceptionExists(finalNode.loc)
        ) {
          descriptors.push({
            node: finalNode,
            messageId:
              targetNode === finalNode
                ? 'asyncMustBeAwaited'
                : 'promisesWithAsyncAssertionsMustBeAwaited',
          });
        }
        if (isParentArrayExpression) {
          pushPromiseArrayException(finalNode.loc);
        }
      },
      'Program:exit'() {
        const fixes: RuleFix[] = [];

        descriptors.forEach(({ node, messageId }, index) => {
          const orReturned = alwaysAwait ? '' : ' or returned';

          context.report({
            loc: node.loc,
            data: { orReturned },
            messageId,
            node,
            fix(fixer) {
              const functionExpression = findFirstFunctionExpression(node);

              if (!functionExpression) {
                return null;
              }
              const foundAsyncFixer = fixes.some(fix => fix.text === 'async ');

              if (!functionExpression.async && !foundAsyncFixer) {
                const targetFunction =
                  getNormalizeFunctionExpression(functionExpression);

                fixes.push(fixer.insertTextBefore(targetFunction, 'async '));
              }

              const returnStatement =
                node.parent?.type === AST_NODE_TYPES.ReturnStatement
                  ? node.parent
                  : null;

              if (alwaysAwait && returnStatement) {
                const sourceCodeText =
                  getSourceCode(context).getText(returnStatement);
                const replacedText = sourceCodeText.replace('return', 'await');

                fixes.push(fixer.replaceText(returnStatement, replacedText));
              } else {
                fixes.push(fixer.insertTextBefore(node, 'await '));
              }

              return index === descriptors.length - 1 ? fixes : null;
            },
          });
        });
      },
    };
  },
});
