import { createRule, getNodeName, isDescribe, isTestCase } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Use `.only` and `.skip` over `f` and `x`',
      recommended: 'error',
    },
    messages: {
      usePreferredName: 'Use "{{ preferredNodeName }}" instead',
    },
    fixable: 'code',
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const nodeName = getNodeName(node.callee);

        if (!nodeName || (!isDescribe(node) && !isTestCase(node))) return;

        const preferredNodeName = getPreferredNodeName(nodeName);

        if (!preferredNodeName) return;

        context.report({
          messageId: 'usePreferredName',
          node: node.callee,
          data: { preferredNodeName },
          fix(fixer) {
            return [fixer.replaceText(node.callee, preferredNodeName)];
          },
        });
      },
    };
  },
});

function getPreferredNodeName(nodeName: string) {
  const firstChar = nodeName.charAt(0);

  if (firstChar === 'f') {
    return `${nodeName.slice(1)}.only`;
  }

  if (firstChar === 'x') {
    return `${nodeName.slice(1)}.skip`;
  }
}
