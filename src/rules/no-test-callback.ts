import { createRule, isFunction, isTestCase } from './tsUtils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Avoid using a callback in asynchronous tests',
      recommended: false,
    },
    messages: {
      illegalTestCallback: 'Illegal usage of test callback',
    },
    fixable: 'code',
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

        context.report({
          node: argument,
          messageId: 'illegalTestCallback',
          fix(fixer) {
            const { body } = callback;

            /* istanbul ignore if */
            if (!body) {
              throw new Error(
                `Unexpected null when attempting to fix ${context.getFilename()} - please file a github issue at https://github.com/jest-community/eslint-plugin-jest`,
              );
            }

            const sourceCode = context.getSourceCode();
            const firstBodyToken = sourceCode.getFirstToken(body);
            const lastBodyToken = sourceCode.getLastToken(body);
            const tokenBeforeArgument = sourceCode.getTokenBefore(argument);
            const tokenAfterArgument = sourceCode.getTokenAfter(argument);

            /* istanbul ignore if */
            if (
              !('name' in argument) ||
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

            if (body.type === 'BlockStatement') {
              const keyword = callback.async ? 'await' : 'return';

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
        });
      },
    };
  },
});
