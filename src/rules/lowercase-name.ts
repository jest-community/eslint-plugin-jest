import { createRule } from './tsUtils';
import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';

const isIdentifier = (
  callee: TSESTree.LeftHandSideExpression,
): callee is TSESTree.Identifier => !!callee;

const isItTestOrDescribeFunction = (
  callee: TSESTree.LeftHandSideExpression,
): callee is TSESTree.Identifier => {
  if (!isIdentifier(callee)) {
    return false;
  }

  return (
    callee.name === 'it' || callee.name === 'test' || callee.name === 'describe'
  );
};

const isItDescription = (
  expression?: TSESTree.Expression,
): expression is TSESTree.Literal | TSESTree.TemplateLiteral =>
  !!expression &&
  (expression.type === AST_NODE_TYPES.Literal ||
    expression.type === AST_NODE_TYPES.TemplateLiteral);

const testDescription = (
  firstArgument: TSESTree.Literal | TSESTree.TemplateLiteral,
) => {
  if (firstArgument.type === AST_NODE_TYPES.Literal) {
    return firstArgument.value as string;
  }

  return firstArgument.quasis[0].value.raw;
};

const descriptionBeginsWithLowerCase = (
  node: TSESTree.CallExpression,
): string | false => {
  const {
    arguments: [firstArgument],
    callee,
  } = node;
  if (isItTestOrDescribeFunction(callee) && isItDescription(firstArgument)) {
    const description = testDescription(firstArgument);
    if (!description[0]) {
      return false;
    }

    if (description[0] !== description[0].toLowerCase()) {
      return callee.name;
    }
  }
  return false;
};

export default createRule({
  name: __filename,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce `it`, `test` and `describe` to have descriptions that begin with a lowercase letter. This provides more readable test failures.',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      unexpectedLowercase: '`{{ method }}`s should begin with lowercase',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignore: { type: 'array', items: { type: 'string' } },
        },
      },
    ],
  } as const,
  defaultOptions: [{ ignore: [] } as { ignore: readonly string[] }],
  create(context, [{ ignore }]) {
    const ignoredFunctionNames = ignore.reduce<
      Record<string, true | undefined>
    >((accumulator, value) => {
      accumulator[value] = true;
      return accumulator;
    }, Object.create(null));

    const isIgnoredFunctionName = (node: TSESTree.CallExpression) =>
      ignoredFunctionNames[(node.callee as TSESTree.Identifier).name];

    return {
      CallExpression(node) {
        const erroneousMethod = descriptionBeginsWithLowerCase(node);

        if (erroneousMethod && !isIgnoredFunctionName(node)) {
          context.report({
            messageId: 'unexpectedLowercase',
            data: { method: erroneousMethod },
            node,
            fix(fixer) {
              const [firstArg] = node.arguments;
              // guaranteed by descriptionBeginsWithLowerCase
              const description = testDescription(firstArg as
                | TSESTree.Literal
                | TSESTree.TemplateLiteral);

              const rangeIgnoringQuotes: [number, number] = [
                firstArg.range[0] + 1,
                firstArg.range[1] - 1,
              ];
              const newDescription =
                description.substring(0, 1).toLowerCase() +
                description.substring(1);

              return [
                fixer.replaceTextRange(rangeIgnoringQuotes, newDescription),
              ];
            },
          });
        }
      },
    };
  },
});
