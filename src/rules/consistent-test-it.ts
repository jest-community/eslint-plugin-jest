import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  TestCaseName,
  createRule,
  isTypeOfJestFnCall,
  parseJestFnCall,
} from './utils';

const buildFixer =
  (
    callee: TSESTree.LeftHandSideExpression,
    nodeName: string,
    preferredTestKeyword: TestCaseName.test | TestCaseName.it,
  ) =>
  (fixer: TSESLint.RuleFixer) => [
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
      description: 'Enforce `test` and `it` usage conventions',
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
            type: 'string',
            enum: [TestCaseName.it, TestCaseName.test],
          },
          withinDescribe: {
            type: 'string',
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
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (jestFnCall.type === 'describe') {
          describeNestingLevel++;

          return;
        }

        const funcNode =
          node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
            ? node.callee.tag
            : node.callee.type === AST_NODE_TYPES.CallExpression
            ? node.callee.callee
            : node.callee;

        if (
          jestFnCall.type === 'test' &&
          describeNestingLevel === 0 &&
          !jestFnCall.name.endsWith(testKeyword)
        ) {
          const oppositeTestKeyword = getOppositeTestKeyword(testKeyword);

          context.report({
            messageId: 'consistentMethod',
            node: node.callee,
            data: { testKeyword, oppositeTestKeyword },
            fix: buildFixer(funcNode, jestFnCall.name, testKeyword),
          });
        }

        if (
          jestFnCall.type === 'test' &&
          describeNestingLevel > 0 &&
          !jestFnCall.name.endsWith(testKeywordWithinDescribe)
        ) {
          const oppositeTestKeyword = getOppositeTestKeyword(
            testKeywordWithinDescribe,
          );

          context.report({
            messageId: 'consistentMethodWithinDescribe',
            node: node.callee,
            data: { testKeywordWithinDescribe, oppositeTestKeyword },
            fix: buildFixer(
              funcNode,
              jestFnCall.name,
              testKeywordWithinDescribe,
            ),
          });
        }
      },
      'CallExpression:exit'(node) {
        if (isTypeOfJestFnCall(node, context, ['describe'])) {
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
