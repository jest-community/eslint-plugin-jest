import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  TestCaseName,
  createRule,
  getNodeName,
  isDescribe,
  isTestCase,
} from './utils';

const buildFixer = (
  callee: TSESTree.LeftHandSideExpression,
  nodeName: string,
  preferredTestKeyword: TestCaseName.test | TestCaseName.it,
) => (fixer: TSESLint.RuleFixer) => [
  fixer.replaceText(
    callee.type === AST_NODE_TYPES.MemberExpression ? callee.object : callee,
    getPreferredNodeName(nodeName, preferredTestKeyword),
  ),
];

export default createRule<
  [
    Partial<{
      fn: TestCaseName.it | TestCaseName.test;
      withinDescribe: TestCaseName.it | TestCaseName.test;
    }>,
  ],
  'consistentMethod' | 'consistentMethodWithinDescribe'
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
      consistentMethodWithinDescribe:
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
      CallExpression(node: TSESTree.CallExpression) {
        const nodeName = getNodeName(node.callee);

        if (!nodeName) {
          return;
        }

        if (isDescribe(node)) {
          describeNestingLevel++;
        }

        const funcNode =
          node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
            ? node.callee.tag
            : node.callee;

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
            fix: buildFixer(funcNode, nodeName, testKeyword),
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
            messageId: 'consistentMethodWithinDescribe',
            node: node.callee,
            data: { testKeywordWithinDescribe, oppositeTestKeyword },
            fix: buildFixer(funcNode, nodeName, testKeywordWithinDescribe),
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
  if (nodeName === TestCaseName.fit) {
    return 'test.only';
  }

  return nodeName.startsWith('f') || nodeName.startsWith('x')
    ? nodeName.charAt(0) + preferredTestKeyword
    : preferredTestKeyword;
}

function getOppositeTestKeyword(test: TestCaseName.test | TestCaseName.it) {
  if (test === TestCaseName.test) {
    return TestCaseName.it;
  }

  return TestCaseName.test;
}
