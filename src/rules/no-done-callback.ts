import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getNodeName,
  isFunction,
  isHook,
  isTestCase,
} from './utils';

const findCallbackArg = (
  node: TSESTree.CallExpression,
  isJestEach: boolean,
): TSESTree.CallExpression['arguments'][0] | null => {
  if (isJestEach) {
    return node.arguments[1];
  }

  if (isHook(node) && node.arguments.length >= 1) {
    return node.arguments[0];
  }

  if (isTestCase(node) && node.arguments.length >= 2) {
    return node.arguments[1];
  }

  return null;
};

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Avoid using a callback in asynchronous tests and hooks',
      recommended: 'error',
      suggestion: true,
    },
    messages: {
      noDoneCallback:
        'Return a Promise instead of relying on callback parameter',
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
        // done is the second argument for it.each, not the first
        const isJestEach = getNodeName(node.callee)?.endsWith('.each') ?? false;

        const callback = findCallbackArg(node, isJestEach);
        const callbackArgIndex = Number(isJestEach);

        if (
          !callback ||
          !isFunction(callback) ||
          callback.params.length !== 1 + callbackArgIndex
        ) {
          return;
        }

        const argument = callback.params[callbackArgIndex];

        if (argument.type !== AST_NODE_TYPES.Identifier) {
          context.report({
            node: argument,
            messageId: 'noDoneCallback',
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
          messageId: 'noDoneCallback',
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
