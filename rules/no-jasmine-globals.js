'use strict';

const { getDocsUrl, getNodeName } = require('./util');

const globalAlternatives = {
  spyOn: 'Illegal usage of global `spyOn`, prefer `jest.spyOn`',
  spyOnProperty: 'Illegal usage of global `spyOnProperty`, prefer `jest.spyOn`',
  fail:
    'Illegal usage of `fail`, prefer throwing an error, or the `done.fail` callback',
  pending:
    'Illegal usage of `pending`, prefer explicitly skipping a test using `test.skip`',
};

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
        const calleeName = getNodeName(node.callee);

        if (!calleeName) {
          return;
        }
        if (
          calleeName === 'spyOn' ||
          calleeName === 'spyOnProperty' ||
          calleeName === 'fail' ||
          calleeName === 'pending'
        ) {
          context.report({
            node,
            message: globalAlternatives[calleeName],
          });
          return;
        }

        if (calleeName.startsWith('jasmine.')) {
          const functionName = calleeName.replace('jasmine.', '');

          if (
            functionName === 'any' ||
            functionName === 'anything' ||
            functionName === 'arrayContaining' ||
            functionName === 'objectContaining' ||
            functionName === 'stringMatching'
          ) {
            context.report({
              fix(fixer) {
                return [fixer.replaceText(node.callee.object, 'expect')];
              },
              node,
              message: `Illegal usage of \`${calleeName}\`, prefer \`expect.${functionName}\``,
            });
            return;
          }

          if (functionName === 'addMatchers') {
            context.report({
              node,
              message: `Illegal usage of \`${calleeName}\`, prefer \`expect.extend\``,
            });
            return;
          }

          if (functionName === 'createSpy') {
            context.report({
              node,
              message: `Illegal usage of \`${calleeName}\`, prefer \`jest.fn\``,
            });
            return;
          }

          context.report({
            node,
            message: 'Illegal usage of jasmine global',
          });
        }
      },
      MemberExpression(node) {
        if (node.object.name === 'jasmine') {
          if (node.parent.type === 'AssignmentExpression') {
            if (node.property.name === 'DEFAULT_TIMEOUT_INTERVAL') {
              context.report({
                fix(fixer) {
                  return [
                    fixer.replaceText(
                      node.parent,
                      `jest.setTimeout(${node.parent.right.value})`
                    ),
                  ];
                },
                node,
                message: 'Illegal usage of jasmine global',
              });
              return;
            }

            context.report({
              node,
              message: 'Illegal usage of jasmine global',
            });
          }
        }
      },
    };
  },
};
