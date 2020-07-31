import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { createRule, isFunction, isTestCase } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Avoid using a callback in asynchronous tests',
      recommended: 'error',
      suggestion: true,
    },
    messages: {
      illegalTestCallback: 'Illegal usage of test callback',
      suggestWrappingInPromise: 'Wrap in `new Promise({{ callback }} => ...`',
      useAwaitInsteadOfCallback:
        'Use await instead of callback in async functions',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestCase(node) || node.arguments.length !== 2) {
          return;
        }

        const [, callback] = node.arguments;

        if (!isFunction(callback) || callback.params.length !== 1) {
          return;
        }

        const [argument] = callback.params;

        if (argument.type !== AST_NODE_TYPES.Identifier) {
          context.report({
            node: argument,
            messageId: 'illegalTestCallback',
          });

          return;
        }

        if (callback.async) {
          context.report({
            node: argument,
            messageId: 'useAwaitInsteadOfCallback',
          });

          return;
        }

        context.report({
          node: argument,
          messageId: 'illegalTestCallback',
          suggest: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: argument.name },
              fix(fixer) {
                const { body } = callback;

                const sourceCode = context.getSourceCode();
                const firstBodyToken = sourceCode.getFirstToken(body);
                const lastBodyToken = sourceCode.getLastToken(body);
                const tokenBeforeArgument = sourceCode.getTokenBefore(argument);
                const tokenAfterArgument = sourceCode.getTokenAfter(argument);

                /* istanbul ignore if */
                if (
                  !firstBodyToken ||
                  !lastBodyToken ||
                  !tokenBeforeArgument ||
                  !tokenAfterArgument
                ) {
                  throw new Error(
                    `Unexpected null when attempting to fix ${context.getFilename()} - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
                  );
                }

                const argumentInParens =
                  tokenBeforeArgument.value === '(' &&
                  tokenAfterArgument.value === ')';

                let argumentFix = fixer.replaceText(argument, '()');

                if (argumentInParens) {
                  argumentFix = fixer.remove(argument);
                }

                let newCallback = argument.name;

                if (argumentInParens) {
                  newCallback = `(${newCallback})`;
                }

                let beforeReplacement = `new Promise(${newCallback} => `;
                let afterReplacement = ')';
                let replaceBefore = true;

                if (body.type === AST_NODE_TYPES.BlockStatement) {
                  const keyword = 'return';

                  beforeReplacement = `${keyword} ${beforeReplacement}{`;
                  afterReplacement += '}';
                  replaceBefore = false;
                }

                return [
                  argumentFix,
                  replaceBefore
                    ? fixer.insertTextBefore(firstBodyToken, beforeReplacement)
                    : fixer.insertTextAfter(firstBodyToken, beforeReplacement),
                  fixer.insertTextAfter(lastBodyToken, afterReplacement),
                ];
              },
            },
          ],
        });
      },
    };
  },
});
