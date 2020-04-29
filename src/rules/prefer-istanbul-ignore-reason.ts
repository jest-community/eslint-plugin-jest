import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule } from './utils';

function hasIgnore(comment: string): boolean {
  return /istanbul ignore \w+/u.test(comment);
}

function hasReason(comment: string): boolean {
  return /istanbul ignore \w+: .*/u.test(comment);
}

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'This rule raises a warning about "istanbul ignore" comments missing a reason.',
      recommended: false,
    },
    messages: {
      noReason: 'Add a reason why code should be ignored',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    function checkNode(node: TSESTree.Comment) {
      const trimmedComment = node.value.trim();

      if (!hasIgnore(trimmedComment)) {
        return;
      }

      if (hasReason(trimmedComment)) {
        return;
      }

      context.report({ messageId: 'noReason', node });
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.forEach(checkNode);
      },
    };
  },
});
