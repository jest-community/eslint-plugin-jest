import {
  ParsedExpectMatcher,
  createRule,
  isDescribeCall,
  isExpectCall,
  isStringNode,
  isTestCaseCall,
  parseExpectCall,
} from './utils';

const snapshotMatchers = ['toMatchSnapshot', 'toThrowErrorMatchingSnapshot'];

const isSnapshotMatcher = (matcher: ParsedExpectMatcher) => {
  return snapshotMatchers.includes(matcher.name);
};

const isSnapshotMatcherWithoutHint = (matcher: ParsedExpectMatcher) => {
  if (!matcher.arguments || matcher.arguments.length === 0) {
    return true;
  }

  // this matcher only supports one argument which is the hint
  if (matcher.name !== 'toMatchSnapshot') {
    return matcher.arguments.length !== 1;
  }

  // if we're being passed two arguments,
  // the second one should be the hint
  if (matcher.arguments.length === 2) {
    return false;
  }

  const [arg] = matcher.arguments;

  // the first argument to `toMatchSnapshot` can be _either_ a snapshot hint or
  // an object with asymmetric matchers, so we can't just assume that the first
  // argument is a hint when it's by itself.
  return !isStringNode(arg);
};

const messages = {
  missingHint: 'You should provide a hint for this snapshot',
};

export default createRule<[('always' | 'multi')?], keyof typeof messages>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Prefer including a hint with external snapshots',
      recommended: false,
    },
    messages,
    type: 'suggestion',
    schema: [
      {
        type: 'string',
        enum: ['always', 'multi'],
      },
    ],
  },
  defaultOptions: ['multi'],
  create(context, [mode]) {
    const scope = context.getScope();
    const snapshotMatchers: ParsedExpectMatcher[] = [];
    const depths: number[] = [];
    let expressionDepth = 0;

    const reportSnapshotMatchersWithoutHints = () => {
      for (const snapshotMatcher of snapshotMatchers) {
        if (isSnapshotMatcherWithoutHint(snapshotMatcher)) {
          context.report({
            messageId: 'missingHint',
            node: snapshotMatcher.node.property,
          });
        }
      }
    };

    const enterExpression = () => {
      expressionDepth++;
    };

    const exitExpression = () => {
      expressionDepth--;

      if (mode === 'always') {
        reportSnapshotMatchersWithoutHints();
        snapshotMatchers.length = 0;
      }

      if (mode === 'multi' && expressionDepth === 0) {
        if (snapshotMatchers.length > 1) {
          reportSnapshotMatchersWithoutHints();
        }

        snapshotMatchers.length = 0;
      }
    };

    return {
      'Program:exit'() {
        enterExpression();
        exitExpression();
      },
      FunctionExpression: enterExpression,
      'FunctionExpression:exit': exitExpression,
      ArrowFunctionExpression: enterExpression,
      'ArrowFunctionExpression:exit': exitExpression,
      'CallExpression:exit'(node) {
        if (isDescribeCall(node, scope) || isTestCaseCall(node, scope)) {
          /* istanbul ignore next */
          expressionDepth = depths.pop() ?? 0;
        }
      },
      CallExpression(node) {
        if (isDescribeCall(node, scope) || isTestCaseCall(node, scope)) {
          depths.push(expressionDepth);
          expressionDepth = 0;
        }

        if (!isExpectCall(node)) {
          return;
        }

        const { matcher } = parseExpectCall(node);

        if (!matcher || !isSnapshotMatcher(matcher)) {
          return;
        }

        snapshotMatchers.push(matcher);
      },
    };
  },
});
