import type { TSESTree } from '@typescript-eslint/utils';
import { createRule, isTypeOfJestFnCall, parseJestFnCall } from './utils';

const messages = {
  tooManyDescribes:
    'There should not be more than {{ max }} describe{{ s }} at the top level',
  unexpectedTestCase: 'All test cases must be wrapped in a describe block.',
  unexpectedHook: 'All hooks must be wrapped in a describe block.',
};

export default createRule<
  [Partial<{ maxNumberOfTopLevelDescribes: number }>],
  keyof typeof messages
>({
  name: __filename,
  meta: {
    docs: {
      description:
        'Require test cases and hooks to be inside a `describe` block',
    },
    messages,
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          maxNumberOfTopLevelDescribes: {
            type: 'number',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const { maxNumberOfTopLevelDescribes = Infinity } =
      context.options[0] ?? {};
    let numberOfTopLevelDescribeBlocks = 0;
    let numberOfDescribeBlocks = 0;

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (jestFnCall.type === 'describe') {
          numberOfDescribeBlocks++;

          if (numberOfDescribeBlocks === 1) {
            numberOfTopLevelDescribeBlocks++;
            if (numberOfTopLevelDescribeBlocks > maxNumberOfTopLevelDescribes) {
              context.report({
                node,
                messageId: 'tooManyDescribes',
                data: {
                  max: maxNumberOfTopLevelDescribes,
                  s: maxNumberOfTopLevelDescribes === 1 ? '' : 's',
                },
              });
            }
          }

          return;
        }

        if (numberOfDescribeBlocks === 0) {
          if (jestFnCall.type === 'test') {
            context.report({ node, messageId: 'unexpectedTestCase' });

            return;
          }

          if (jestFnCall.type === 'hook') {
            context.report({ node, messageId: 'unexpectedHook' });

            return;
          }
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (isTypeOfJestFnCall(node, context, ['describe'])) {
          numberOfDescribeBlocks--;
        }
      },
    };
  },
});
