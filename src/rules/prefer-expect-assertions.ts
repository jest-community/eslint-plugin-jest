import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  KnownCallExpression,
  createRule,
  getAccessorValue,
  hasOnlyOneArgument,
  isEachCall,
  isFunction,
  isSupportedAccessor,
  isTestCaseCall,
} from './utils';

const isExpectAssertionsOrHasAssertionsCall = (
  expression: TSESTree.Node,
): expression is KnownCallExpression<'assertions' | 'hasAssertions'> =>
  expression.type === AST_NODE_TYPES.CallExpression &&
  expression.callee.type === AST_NODE_TYPES.MemberExpression &&
  isSupportedAccessor(expression.callee.object, 'expect') &&
  isSupportedAccessor(expression.callee.property) &&
  ['assertions', 'hasAssertions'].includes(
    getAccessorValue(expression.callee.property),
  );

const isFirstLineExprStmt = (
  functionBody: TSESTree.Statement[],
): functionBody is [TSESTree.ExpressionStatement] =>
  functionBody[0] &&
  functionBody[0].type === AST_NODE_TYPES.ExpressionStatement;

const suggestRemovingExtraArguments = (
  args: TSESTree.CallExpression['arguments'],
  extraArgsStartAt: number,
): TSESLint.ReportSuggestionArray<MessageIds>[0] => ({
  messageId: 'suggestRemovingExtraArguments',
  fix: fixer =>
    fixer.removeRange([
      args[extraArgsStartAt].range[0] - Math.sign(extraArgsStartAt),
      args[args.length - 1].range[1],
    ]),
});

interface RuleOptions {
  onlyFunctionsWithAsyncKeyword?: boolean;
}

type MessageIds =
  | 'hasAssertionsTakesNoArguments'
  | 'assertionsRequiresOneArgument'
  | 'assertionsRequiresNumberArgument'
  | 'haveExpectAssertions'
  | 'suggestAddingHasAssertions'
  | 'suggestAddingAssertions'
  | 'suggestRemovingExtraArguments';

const suggestions: Array<[MessageIds, string]> = [
  ['suggestAddingHasAssertions', 'expect.hasAssertions();'],
  ['suggestAddingAssertions', 'expect.assertions();'],
];

export default createRule<[RuleOptions], MessageIds>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Suggest using `expect.assertions()` OR `expect.hasAssertions()`',
      recommended: false,
      suggestion: true,
    },
    messages: {
      hasAssertionsTakesNoArguments:
        '`expect.hasAssertions` expects no arguments',
      assertionsRequiresOneArgument:
        '`expect.assertions` excepts a single argument of type number',
      assertionsRequiresNumberArgument: 'This argument should be a number',
      haveExpectAssertions:
        'Every test should have either `expect.assertions(<number of assertions>)` or `expect.hasAssertions()` as its first expression',
      suggestAddingHasAssertions: 'Add `expect.hasAssertions()`',
      suggestAddingAssertions:
        'Add `expect.assertions(<number of assertions>)`',
      suggestRemovingExtraArguments: 'Remove extra arguments',
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          onlyFunctionsWithAsyncKeyword: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ onlyFunctionsWithAsyncKeyword: false }],
  create(context, [options]) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isTestCaseCall(node)) {
          return;
        }

        const args = isEachCall(node) ? node.parent.arguments : node.arguments;

        if (args.length < 2) {
          return;
        }

        const [, testFn] = args;

        if (
          !isFunction(testFn) ||
          testFn.body.type !== AST_NODE_TYPES.BlockStatement ||
          (options.onlyFunctionsWithAsyncKeyword && !testFn.async)
        ) {
          return;
        }

        const testFuncBody = testFn.body.body;

        if (!isFirstLineExprStmt(testFuncBody)) {
          context.report({
            messageId: 'haveExpectAssertions',
            node,
            suggest: suggestions.map(([messageId, text]) => ({
              messageId,
              fix: fixer =>
                fixer.insertTextBeforeRange(
                  [testFn.body.range[0] + 1, testFn.body.range[1]],
                  text,
                ),
            })),
          });

          return;
        }

        const testFuncFirstLine = testFuncBody[0].expression;

        if (!isExpectAssertionsOrHasAssertionsCall(testFuncFirstLine)) {
          context.report({
            messageId: 'haveExpectAssertions',
            node,
            suggest: suggestions.map(([messageId, text]) => ({
              messageId,
              fix: fixer => fixer.insertTextBefore(testFuncBody[0], text),
            })),
          });

          return;
        }

        if (
          isSupportedAccessor(
            testFuncFirstLine.callee.property,
            'hasAssertions',
          )
        ) {
          if (testFuncFirstLine.arguments.length) {
            context.report({
              messageId: 'hasAssertionsTakesNoArguments',
              node: testFuncFirstLine.callee.property,
              suggest: [
                suggestRemovingExtraArguments(testFuncFirstLine.arguments, 0),
              ],
            });
          }

          return;
        }

        if (!hasOnlyOneArgument(testFuncFirstLine)) {
          let { loc } = testFuncFirstLine.callee.property;
          const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];

          if (testFuncFirstLine.arguments.length) {
            loc = testFuncFirstLine.arguments[1].loc;
            suggest.push(
              suggestRemovingExtraArguments(testFuncFirstLine.arguments, 1),
            );
          }

          context.report({
            messageId: 'assertionsRequiresOneArgument',
            suggest,
            loc,
          });

          return;
        }

        const [arg] = testFuncFirstLine.arguments;

        if (
          arg.type === AST_NODE_TYPES.Literal &&
          typeof arg.value === 'number' &&
          Number.isInteger(arg.value)
        ) {
          return;
        }

        context.report({
          messageId: 'assertionsRequiresNumberArgument',
          node: arg,
        });
      },
    };
  },
});
