'use strict';

const getDocsUrl = require('./util').getDocsUrl;

function getName(node) {
  function joinNames(a, b) {
    return a && b ? `${a}.${b}` : null;
  }

  switch (node && node.type) {
    case 'Identifier':
      return node.name;
    case 'Literal':
      return node.value;
    case 'MemberExpression':
      return joinNames(getName(node.object), getName(node.property));
  }

  return null;
}

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    let suiteDepth = 0;
    let testDepth = 0;

    return {
      CallExpression(node) {
        const functionName = getName(node.callee);

        switch (functionName) {
          case 'describe':
            suiteDepth++;
            break;

          case 'describe.skip':
            context.report({ message: 'Skipped test suite', node });
            break;

          case 'it':
          case 'test':
            testDepth++;
            if (node.arguments.length < 2) {
              context.report({
                message: 'Test is missing function argument',
                node,
              });
            }
            break;

          case 'it.skip':
          case 'test.skip':
            context.report({ message: 'Skipped test', node });
            break;

          case 'pending':
            if (testDepth > 0) {
              context.report({
                message: 'Call to pending() within test',
                node,
              });
            } else if (suiteDepth > 0) {
              context.report({
                message: 'Call to pending() within test suite',
                node,
              });
            } else {
              context.report({
                message: 'Call to pending()',
                node,
              });
            }
            break;

          case 'xdescribe':
            context.report({ message: 'Disabled test suite', node });
            break;

          case 'xit':
          case 'xtest':
            context.report({ message: 'Disabled test', node });
            break;
        }
      },

      'CallExpression:exit'(node) {
        const functionName = getName(node.callee);

        switch (functionName) {
          case 'describe':
            suiteDepth--;
            break;

          case 'it':
          case 'test':
            testDepth--;
            break;
        }
      },
    };
  },
};
