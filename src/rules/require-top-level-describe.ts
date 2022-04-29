import { TSESTree } from '@typescript-eslint/utils';
import { createRule, isDescribeCall, isHook, isTestCaseCall } from './utils';

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
      category: 'Best Practices',
      description:
        'Require test cases and hooks to be inside a `describe` block',
      recommended: false,
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
    const scope = context.getScope();
    let numberOfTopLevelDescribeBlocks = 0;
    let numberOfDescribeBlocks = 0;

    return {
      CallExpression(node) {
        if (isDescribeCall(node, scope)) {
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
          if (isTestCaseCall(node, scope)) {
            context.report({ node, messageId: 'unexpectedTestCase' });

            return;
          }

          if (isHook(node)) {
            context.report({ node, messageId: 'unexpectedHook' });

            return;
          }
        }
      },
      'CallExpression:exit'(node: TSESTree.CallExpression) {
        if (isDescribeCall(node, scope)) {
          numberOfDescribeBlocks--;
        }
      },
    };
  },
});
