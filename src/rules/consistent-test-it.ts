import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import {
  TestCaseName,
  createRule,
  getNodeName,
  isDescribe,
  isTestCase,
} from './utils';

export default createRule<
  [
    Partial<{
      fn: TestCaseName.it | TestCaseName.test;
      withinDescribe: TestCaseName.it | TestCaseName.test;
    }>,
  ],
  'consistentMethod' | 'consistentMethodWithingDescribe'
>({
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
            enum: [TestCaseName.it, TestCaseName.test],
          },
          withinDescribe: {
            enum: [TestCaseName.it, TestCaseName.test],
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
  create(context) {
    const configObj = context.options[0] || {};
    const testKeyword = configObj.fn || TestCaseName.test;
    const testKeywordWithinDescribe =
      configObj.withinDescribe || configObj.fn || TestCaseName.it;

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

function getPreferredNodeName(
  nodeName: string,
  preferredTestKeyword: TestCaseName.test | TestCaseName.it,
) {
  switch (nodeName) {
    case TestCaseName.fit:
      return 'test.only';
    default:
      return nodeName.startsWith('f') || nodeName.startsWith('x')
        ? nodeName.charAt(0) + preferredTestKeyword
        : preferredTestKeyword;
  }
}

function getOppositeTestKeyword(test: TestCaseName.test | TestCaseName.it) {
  if (test === TestCaseName.test) {
    return TestCaseName.it;
  }

  return TestCaseName.test;
}
