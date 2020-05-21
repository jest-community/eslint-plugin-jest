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
  isSupportedAccessor,
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

interface PreferExpectAssertionsCallExpression extends TSESTree.CallExpression {
  arguments: [
    TSESTree.Expression,
    TSESTree.ArrowFunctionExpression & { body: TSESTree.BlockStatement },
  ];
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

export default createRule<[], MessageIds>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Suggest using `expect.assertions()` OR `expect.hasAssertions()`',
      recommended: false,
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
          context.report({
            messageId: 'haveExpectAssertions',
            node,
            suggest: suggestions.map(([messageId, text]) => ({
              messageId,
              fix: fixer =>
                fixer.insertTextBeforeRange(
                  [
                    node.arguments[1].body.range[0] + 1,
                    node.arguments[1].body.range[1],
                  ],
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
          const report: TSESLint.ReportDescriptor<MessageIds> = {
            messageId: 'assertionsRequiresOneArgument',
            loc: testFuncFirstLine.callee.property.loc,
          };

          if (testFuncFirstLine.arguments.length) {
            report.loc = testFuncFirstLine.arguments[1].loc;
            report.suggest = [
              suggestRemovingExtraArguments(testFuncFirstLine.arguments, 1),
            ];
          }

          context.report(report);

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
