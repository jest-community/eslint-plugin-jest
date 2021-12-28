import {
  ParsedExpectMatcher,
  createRule,
  isExpectCall,
  isTestCaseCall,
  parseExpectCall,
} from './utils';

const snapshotMatchers = ['toMatchSnapshot', 'toThrowErrorMatchingSnapshot'];

const isSnapshotMatcher = (matcher: ParsedExpectMatcher) => {
  return snapshotMatchers.includes(matcher.name);
};

const isSnapshotMatcherWithoutHint = (matcher: ParsedExpectMatcher) => {
  if (!isSnapshotMatcher(matcher)) {
    return false;
  }

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
    let withinTestBody = false;
    let previousSnapshotMatcher: ParsedExpectMatcher | null = null;
    let hasReportedPreviousSnapshotMatcher = false;

    return {
      CallExpression(node) {
        if (isTestCaseCall(node)) {
          withinTestBody = true;

          return;
        }

        if (!isExpectCall(node)) {
          return;
        }

        const { matcher } = parseExpectCall(node);

        if (!matcher) {
          return;
        }

        if (mode === 'always' && isSnapshotMatcherWithoutHint(matcher)) {
          context.report({
            messageId: 'missingHint',
            node: matcher.node.property,
          });

          return;
        }

        if (!withinTestBody || !isSnapshotMatcher(matcher)) {
          return;
        }

        if (!previousSnapshotMatcher) {
          previousSnapshotMatcher = matcher;

          return;
        }

        if (isSnapshotMatcherWithoutHint(matcher)) {
          context.report({
            messageId: 'missingHint',
            node: matcher.node.property,
          });
        }

        if (
          isSnapshotMatcherWithoutHint(previousSnapshotMatcher) &&
          !hasReportedPreviousSnapshotMatcher
        ) {
          context.report({
            messageId: 'missingHint',
            node: previousSnapshotMatcher.node.property,
          });

          hasReportedPreviousSnapshotMatcher = true;
        }
      },
      'CallExpression:exit'(node) {
        if (isTestCaseCall(node)) {
          withinTestBody = false;
          previousSnapshotMatcher = null;
          hasReportedPreviousSnapshotMatcher = false;
        }
      },
    };
  },
});
