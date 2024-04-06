import type { TSESTree } from '@typescript-eslint/utils';
import { createRule, isTypeOfJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow conditional logic in tests',
    },
    messages: {
      conditionalInTest: 'Avoid having conditionals in tests',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
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
        if (isTypeOfJestFnCall(node, context, ['test'])) {
          inTestCase = true;
        }
      },
      'CallExpression:exit'(node) {
        if (isTypeOfJestFnCall(node, context, ['test'])) {
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
