import {
  type ParsedExpectFnCall,
  createRule,
  getAccessorValue,
  isStringNode,
  isSupportedAccessor,
  isTypeOfJestFnCall,
  parseJestFnCall,
} from './utils';

const snapshotMatchers = ['toMatchSnapshot', 'toThrowErrorMatchingSnapshot'];
const snapshotMatcherNames = snapshotMatchers;

const isSnapshotMatcherWithoutHint = (expectFnCall: ParsedExpectFnCall) => {
  if (expectFnCall.args.length === 0) {
    return true;
  }

  // this matcher only supports one argument which is the hint
  if (!isSupportedAccessor(expectFnCall.matcher, 'toMatchSnapshot')) {
    return expectFnCall.args.length !== 1;
  }

  // if we're being passed two arguments,
  // the second one should be the hint
  if (expectFnCall.args.length === 2) {
    return false;
  }

  const [arg] = expectFnCall.args;

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
      description: 'Prefer including a hint with external snapshots',
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
    const snapshotMatchers: ParsedExpectFnCall[] = [];
    const depths: number[] = [];
    let expressionDepth = 0;

    const reportSnapshotMatchersWithoutHints = () => {
      for (const snapshotMatcher of snapshotMatchers) {
        if (isSnapshotMatcherWithoutHint(snapshotMatcher)) {
          context.report({
            messageId: 'missingHint',
            node: snapshotMatcher.matcher,
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
        if (isTypeOfJestFnCall(node, context, ['describe', 'test'])) {
          /* istanbul ignore next */
          expressionDepth = depths.pop() ?? 0;
        }
      },
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          if (jestFnCall?.type === 'describe' || jestFnCall?.type === 'test') {
            depths.push(expressionDepth);
            expressionDepth = 0;
          }

          return;
        }

        const matcherName = getAccessorValue(jestFnCall.matcher);

        if (!snapshotMatcherNames.includes(matcherName)) {
          return;
        }

        snapshotMatchers.push(jestFnCall);
      },
    };
  },
});
