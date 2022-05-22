import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule, getAccessorValue, parseJestFnCall_1 } from './utils';

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
        const scope = context.getScope();
        const jestFnCall = parseJestFnCall_1(node, scope);

        if (jestFnCall?.type !== 'describe' && jestFnCall?.type !== 'test') {
          return;
        }

        if (jestFnCall.name[0] !== 'f' && jestFnCall.name[0] !== 'x') {
          return;
        }

        const preferredNodeName = [
          jestFnCall.name.slice(1),
          jestFnCall.name[0] === 'f' ? 'only' : 'skip',
          ...jestFnCall.members.map(s => getAccessorValue(s)),
        ].join('.');

        const funcNode =
          node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
            ? node.callee.tag
            : node.callee.type === AST_NODE_TYPES.CallExpression
            ? node.callee.callee
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
