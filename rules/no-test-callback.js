'use strict';

const getDocsUrl = require('./util').getDocsUrl;
const isTestCase = require('./util').isTestCase;

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    fixable: 'code',
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestCase(node) || node.arguments.length !== 2) {
          return;
        }

        const callback = node.arguments[1];

        if (callback.params.length === 1) {
          const argument = callback.params[0];
          context.report({
            node: argument,
            message: 'Illegal usage of test callback',
            fix(fixer) {
              const sourceCode = context.getSourceCode();
              const body = callback.body;
              const firstBodyToken = sourceCode.getFirstToken(body);
              const lastBodyToken = sourceCode.getLastToken(body);
              const tokenBeforeArgument = sourceCode.getTokenBefore(argument);
              const tokenAfterArgument = sourceCode.getTokenAfter(argument);
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

              if (body.type === 'BlockStatement') {
                let beforeReplacement = `new Promise(${newCallback} => {`;
                if (callback.async) {
                  beforeReplacement = `await ${beforeReplacement}`;
                } else {
                  beforeReplacement = `return ${beforeReplacement}`;
                }

                return [
                  argumentFix,
                  fixer.insertTextAfter(firstBodyToken, beforeReplacement),
                  fixer.insertTextAfter(lastBodyToken, ')}'),
                ];
              } else {
                return [
                  argumentFix,
                  fixer.insertTextBefore(
                    firstBodyToken,
                    `new Promise(${newCallback} => `
                  ),
                  fixer.insertTextAfter(lastBodyToken, ')'),
                ];
              }
            },
          });
        }
      },
    };
  },
};
