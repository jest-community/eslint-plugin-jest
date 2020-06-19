import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getJestFunctionArguments,
  getStringValue,
  isStringNode,
  isTestCase,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Enforce the usage of hashtag (#something) on the test cases title',
      recommended: false,
    },
    messages: {
      noTagFound: 'Title must contain at least one hashtag',
      disallowedTag: '"#{{ tag }}" is not an allowed hashtag.',
    },
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: {
          allowedHashtags: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ allowedHashtags: [] }],
  create(context, [{ allowedHashtags }]) {
    const words = `(${allowedHashtags.join('|')})`;
    const checkAllowedHashtagsRegex = new RegExp(`.*#${words}\\s`, 'ui');
    const checkHashtagsRegex = new RegExp(`.*#\\w+`, 'ui');

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isTestCase(node)) {
          return;
        }

        const [argument] = getJestFunctionArguments(node);
        if (!argument) {
          return;
        }

        if (!isStringNode(argument)) {
          return;
        }

        const title = getStringValue(argument);
        if (
          allowedHashtags.length > 0 &&
          checkAllowedHashtagsRegex.test(title)
        ) {
          return;
        }

        const matches = checkHashtagsRegex.exec(title);
        if (matches) {
          console.log(matches[0], matches[1]);
          if (allowedHashtags.length === 0) {
            return;
          }

          context.report({
            messageId: 'disallowedTag',
            data: {
              tag: matches[1],
            },
            node: argument,
          });
        } else {
          context.report({
            messageId: 'noTagFound',
            node: argument,
          });
        }
      },
    };
  },
});
