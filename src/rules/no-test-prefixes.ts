import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
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

        const funcNode =
          node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
            ? node.callee.tag
            : node.callee;

        context.report({
          messageId: 'usePreferredName',
          node: node.callee,
          data: { preferredNodeName },
          fix(fixer) {
            return [fixer.replaceText(funcNode, preferredNodeName)];
          },
        });
      },
    };
  },
});

function getPreferredNodeName(nodeName: string) {
  const firstChar = nodeName.charAt(0);

  const suffix = nodeName.endsWith('.each') ? '.each' : '';

  if (firstChar === 'f') {
    return `${nodeName.slice(1).replace('.each', '')}.only${suffix}`;
  }

  if (firstChar === 'x') {
    return `${nodeName.slice(1).replace('.each', '')}.skip${suffix}`;
  }

  return null;
}
