'use strict';

const getDocsUrl = require('./util').getDocsUrl;
const getNodeName = require('./util').getNodeName;

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

        if (calleeName === 'spyOn' || calleeName === 'spyOnProperty') {
          context.report({
            node,
            message: `Avoid using global \`${calleeName}\`, prefer \`jest.spyOn\``,
          });
          return;
        }

        if (calleeName === 'fail') {
          context.report({
            node,
            message:
              'Avoid global `fail`, prefer throwing an error, or the `done` callback',
          });
          return;
        }

        if (calleeName === 'pending') {
          context.report({
            node,
            message:
              'Avoid global `pending`, prefer explicitly skipping a test',
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
              message: `Avoid using \`${calleeName}\`, prefer \`expect.${functionName}\``,
            });
            return;
          }

          if (functionName === 'addMatchers') {
            context.report({
              node,
              message: `Avoid using \`${calleeName}\`, prefer \`expect.extend\``,
            });
            return;
          }

          if (functionName === 'createSpy') {
            context.report({
              node,
              message: `Avoid using \`${calleeName}\`, prefer \`jest.fn\``,
            });
            return;
          }

          context.report({
            node,
            message: 'Avoid using jasmine global',
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
                message: 'Avoid using jasmine global',
              });
              return;
            }

            context.report({
              node,
              message: 'Avoid using jasmine global',
            });
          }
        }
      },
    };
  },
};
