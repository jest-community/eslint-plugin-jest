import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'This rule raises a warning about "istanbul ignore file" comments.',
      recommended: false,
    },
    messages: {
      istanbulIgnoreFile: 'Ignoring whole files is not allowed',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    function checkNode(node: TSESTree.Comment) {
      if (!node.value.trim().startsWith('istanbul ignore file')) {
        return;
      }

      context.report({ messageId: 'istanbulIgnoreFile', node });
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.forEach(checkNode);
      },
    };
  },
});
