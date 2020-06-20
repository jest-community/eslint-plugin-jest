import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getJestFunctionArguments,
  getStringValue,
  isStringNode,
  isTestCase,
} from './utils';

const getAllTags = (title: string, regex: RegExp): string[] => {
  const tags: string[] = [];
  let match = regex.exec(title);

  while (match) {
    const tag = match[0]
      .trim()
      .toLowerCase()
      .replace('#', '');

    tags.push(tag);

    match = regex.exec(title);
  }

  return tags;
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce the usage of hashtag on the test cases title',
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
    const sanitized = allowedHashtags
      .filter((s: string) => /^\w+/iu.test(s))
      .map((s: string) => s.toLowerCase().trim());
    const checkHashtagsRegex = /(?:\s|^)#[A-Za-z0-9-._]+(?:\s|$)/giu;

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

        if (checkHashtagsRegex.test(title)) {
          if (sanitized.length > 0) {
            checkHashtagsRegex.lastIndex = 0;
            const tags = getAllTags(title, checkHashtagsRegex);

            for (const tag of tags) {
              if (!sanitized.includes(tag)) {
                context.report({
                  messageId: 'disallowedTag',
                  data: {
                    tag,
                  },
                  node: argument,
                  loc: argument.loc,
                });
              }
            }
          }
        } else {
          context.report({
            messageId: 'noTagFound',
            node: argument,
            loc: argument.loc,
          });
        }
      },
    };
  },
});
