import {
  ParsedExpectMatcher,
  createRule,
  isExpectCall,
  parseExpectCall,
} from './utils';

const snapshotMatchers = ['toMatchSnapshot', 'toThrowErrorMatchingSnapshot'];

const isSnapshotMatcher = (matcher: ParsedExpectMatcher) => {
  return snapshotMatchers.includes(matcher.name);
};

const isSnapshotMatcherWithoutHint = (matcher: ParsedExpectMatcher) => {
  const expectedNumberOfArgumentsWithHint =
    1 + Number(matcher.name === 'toMatchSnapshot');

  return matcher.arguments?.length !== expectedNumberOfArgumentsWithHint;
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
    const snapshotMatchers: ParsedExpectMatcher[] = [];
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
      CallExpression(node) {
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
