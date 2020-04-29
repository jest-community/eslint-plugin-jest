import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule } from './utils';

function hasIgnore(comment: string): boolean {
  return /^\s*istanbul\s+ignore\s+(if|else|next|file)(?=\W|$)/u.test(comment);
}

function hasReason(comment: string): boolean {
  return /^\s*istanbul\s+ignore\s+(if|else|next|file)\W+\w/u.test(comment);
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
      noReason: 'Add a reason why code coverage should be ignored',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();

    function checkNode(node: TSESTree.Comment) {
      const trimmedComment = node.value.trim();

      if (!hasIgnore(trimmedComment) || hasReason(trimmedComment)) {
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
