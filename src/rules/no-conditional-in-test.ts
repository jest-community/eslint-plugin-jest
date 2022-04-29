import { TSESTree } from '@typescript-eslint/utils';
import { createRule, isTestCaseCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow conditional logic in tests',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      conditionalInTest: 'Avoid having conditionals in tests',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const scope = context.getScope();
    let inTestCase = false;

    const maybeReportConditional = (node: TSESTree.Node) => {
      if (inTestCase) {
        context.report({
          messageId: 'conditionalInTest',
          node,
        });
      }
    };

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (isTestCaseCall(node, scope)) {
          inTestCase = true;
        }
      },
      'CallExpression:exit'(node) {
        if (isTestCaseCall(node, scope)) {
          inTestCase = false;
        }
      },
      IfStatement: maybeReportConditional,
      SwitchStatement: maybeReportConditional,
      ConditionalExpression: maybeReportConditional,
      LogicalExpression: maybeReportConditional,
    };
  },
});
