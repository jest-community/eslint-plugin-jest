import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  type ParsedExpectFnCall,
  createRule,
  getAccessorValue,
  isFunction,
  isTypeOfJestFnCall,
  parseJestFnCall,
  removeExtraArgumentsFixer,
} from './utils';

const isFirstStatement = (node: TSESTree.CallExpression): boolean => {
  let parent: TSESTree.Node['parent'] = node;

  while (parent) {
    if (parent.parent?.type === AST_NODE_TYPES.BlockStatement) {
      return parent.parent.body[0] === parent;
    }

    // if we've hit an arrow function, then it must have a single expression
    // as its body, as otherwise we would have hit the block statement already
    if (parent.parent?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
      return true;
    }

    parent = parent.parent;
  }

  /* istanbul ignore next */
  throw new Error(
    `Could not find BlockStatement - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
  );
};

const suggestRemovingExtraArguments = (
  context: TSESLint.RuleContext<string, unknown[]>,
  func: TSESTree.CallExpression,
  from: number,
): TSESLint.ReportSuggestionArray<MessageIds>[0] => ({
  messageId: 'suggestRemovingExtraArguments',
  fix: fixer => removeExtraArgumentsFixer(fixer, context, func, from),
});

interface RuleOptions {
  onlyFunctionsWithAsyncKeyword?: boolean;
  onlyFunctionsWithExpectInLoop?: boolean;
  onlyFunctionsWithExpectInCallback?: boolean;
}

type MessageIds =
  | 'hasAssertionsTakesNoArguments'
  | 'assertionsRequiresOneArgument'
  | 'assertionsRequiresNumberArgument'
  | 'haveExpectAssertions'
  | 'suggestAddingHasAssertions'
  | 'suggestAddingAssertions'
  | 'suggestRemovingExtraArguments';

export default createRule<[RuleOptions], MessageIds>({
  name: __filename,
  meta: {
    docs: {
      description:
        'Suggest using `expect.assertions()` OR `expect.hasAssertions()`',
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
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          onlyFunctionsWithAsyncKeyword: { type: 'boolean' },
          onlyFunctionsWithExpectInLoop: { type: 'boolean' },
          onlyFunctionsWithExpectInCallback: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      onlyFunctionsWithAsyncKeyword: false,
      onlyFunctionsWithExpectInLoop: false,
      onlyFunctionsWithExpectInCallback: false,
    },
  ],
  create(context, [options]) {
    let expressionDepth = 0;
    let hasExpectInCallback = false;
    let hasExpectInLoop = false;
    let hasExpectAssertionsAsFirstStatement = false;
    let inTestCaseCall = false;
    let inForLoop = false;

    const shouldCheckFunction = (testFunction: TSESTree.FunctionLike) => {
      if (
        !options.onlyFunctionsWithAsyncKeyword &&
        !options.onlyFunctionsWithExpectInLoop &&
        !options.onlyFunctionsWithExpectInCallback
      ) {
        return true;
      }

      if (options.onlyFunctionsWithAsyncKeyword) {
        if (testFunction.async) {
          return true;
        }
      }

      if (options.onlyFunctionsWithExpectInLoop) {
        if (hasExpectInLoop) {
          return true;
        }
      }

      if (options.onlyFunctionsWithExpectInCallback) {
        if (hasExpectInCallback) {
          return true;
        }
      }

      return false;
    };

    const checkExpectHasAssertions = (
      expectFnCall: ParsedExpectFnCall,
      func: TSESTree.CallExpression,
    ) => {
      if (getAccessorValue(expectFnCall.members[0]) === 'hasAssertions') {
        if (expectFnCall.args.length) {
          context.report({
            messageId: 'hasAssertionsTakesNoArguments',
            node: expectFnCall.matcher,
            suggest: [suggestRemovingExtraArguments(context, func, 0)],
          });
        }

        return;
      }

      if (expectFnCall.args.length !== 1) {
        let { loc } = expectFnCall.matcher;
        const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];

        if (expectFnCall.args.length) {
          loc = expectFnCall.args[1].loc;
          suggest.push(suggestRemovingExtraArguments(context, func, 1));
        }

        context.report({
          messageId: 'assertionsRequiresOneArgument',
          suggest,
          loc,
        });

        return;
      }

      const [arg] = expectFnCall.args;

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
    };

    const enterExpression = () => inTestCaseCall && expressionDepth++;
    const exitExpression = () => inTestCaseCall && expressionDepth--;
    const enterForLoop = () => (inForLoop = true);
    const exitForLoop = () => (inForLoop = false);

    return {
      FunctionExpression: enterExpression,
      'FunctionExpression:exit': exitExpression,
      ArrowFunctionExpression: enterExpression,
      'ArrowFunctionExpression:exit': exitExpression,
      ForStatement: enterForLoop,
      'ForStatement:exit': exitForLoop,
      ForInStatement: enterForLoop,
      'ForInStatement:exit': exitForLoop,
      ForOfStatement: enterForLoop,
      'ForOfStatement:exit': exitForLoop,
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type === 'test') {
          inTestCaseCall = true;

          return;
        }

        if (jestFnCall?.type === 'expect' && inTestCaseCall) {
          if (
            expressionDepth === 1 &&
            isFirstStatement(node) &&
            jestFnCall.head.node.parent?.type ===
              AST_NODE_TYPES.MemberExpression &&
            jestFnCall.members.length === 1 &&
            ['assertions', 'hasAssertions'].includes(
              getAccessorValue(jestFnCall.members[0]),
            )
          ) {
            checkExpectHasAssertions(jestFnCall, node);
            hasExpectAssertionsAsFirstStatement = true;
          }

          if (inForLoop) {
            hasExpectInLoop = true;
          }

          if (expressionDepth > 1) {
            hasExpectInCallback = true;
          }
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (!isTypeOfJestFnCall(node, context, ['test'])) {
          return;
        }

        inTestCaseCall = false;

        if (node.arguments.length < 2) {
          return;
        }

        const [, testFn] = node.arguments;

        if (!isFunction(testFn) || !shouldCheckFunction(testFn)) {
          return;
        }

        hasExpectInLoop = false;
        hasExpectInCallback = false;

        if (hasExpectAssertionsAsFirstStatement) {
          hasExpectAssertionsAsFirstStatement = false;

          return;
        }

        const suggestions: Array<[MessageIds, string]> = [];

        if (testFn.body.type === AST_NODE_TYPES.BlockStatement) {
          suggestions.push(
            ['suggestAddingHasAssertions', 'expect.hasAssertions();'],
            ['suggestAddingAssertions', 'expect.assertions();'],
          );
        }

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
      },
    };
  },
});
