import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { createRule, getNodeName, isDescribe, isTestCase } from './tsUtils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Have control over `test` and `it` usages',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      consistentMethod:
        "Prefer using '{{ testKeyword }}' instead of '{{ oppositeTestKeyword }}'",
      consistentMethodWithingDescribe:
        "Prefer using '{{ testKeywordWithinDescribe }}' instead of '{{ oppositeTestKeyword }}' within describe",
    },
    schema: [
      {
        type: 'object',
        properties: {
          fn: {
            enum: ['it', 'test'],
          },
          withinDescribe: {
            enum: ['it', 'test'],
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [
    { fn: 'test', withinDescribe: 'it' } as {
      fn?: 'it' | 'test';
      withinDescribe?: 'it' | 'test';
    },
  ],
  create(context) {
    const configObj = context.options[0] || {};
    const testKeyword = configObj.fn || 'test';
    const testKeywordWithinDescribe =
      configObj.withinDescribe || configObj.fn || 'it';

    let describeNestingLevel = 0;

    return {
      CallExpression(node) {
        const nodeName = getNodeName(node.callee);

        if (!nodeName) {
          return;
        }

        if (isDescribe(node)) {
          describeNestingLevel++;
        }

        if (
          isTestCase(node) &&
          describeNestingLevel === 0 &&
          !nodeName.includes(testKeyword)
        ) {
          const oppositeTestKeyword = getOppositeTestKeyword(testKeyword);

          context.report({
            messageId: 'consistentMethod',
            node: node.callee,
            data: { testKeyword, oppositeTestKeyword },
            fix(fixer) {
              const nodeToReplace =
                node.callee.type === AST_NODE_TYPES.MemberExpression
                  ? node.callee.object
                  : node.callee;

              const fixedNodeName = getPreferredNodeName(nodeName, testKeyword);
              return [fixer.replaceText(nodeToReplace, fixedNodeName)];
            },
          });
        }

        if (
          isTestCase(node) &&
          describeNestingLevel > 0 &&
          !nodeName.includes(testKeywordWithinDescribe)
        ) {
          const oppositeTestKeyword = getOppositeTestKeyword(
            testKeywordWithinDescribe,
          );

          context.report({
            messageId: 'consistentMethodWithingDescribe',
            node: node.callee,
            data: { testKeywordWithinDescribe, oppositeTestKeyword },
            fix(fixer) {
              const nodeToReplace =
                node.callee.type === AST_NODE_TYPES.MemberExpression
                  ? node.callee.object
                  : node.callee;

              const fixedNodeName = getPreferredNodeName(
                nodeName,
                testKeywordWithinDescribe,
              );
              return [fixer.replaceText(nodeToReplace, fixedNodeName)];
            },
          });
        }
      },
      'CallExpression:exit'(node) {
        if (isDescribe(node)) {
          describeNestingLevel--;
        }
      },
    };
  },
});

function getPreferredNodeName(nodeName: string, preferredTestKeyword: string) {
  switch (nodeName) {
    case 'fit':
      return 'test.only';
    default:
      return nodeName.startsWith('f') || nodeName.startsWith('x')
        ? nodeName.charAt(0) + preferredTestKeyword
        : preferredTestKeyword;
  }
}

function getOppositeTestKeyword(test: string) {
  if (test === 'test') {
    return 'it';
  }

  return 'test';
}
