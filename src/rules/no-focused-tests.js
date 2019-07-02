'use strict';

const { getDocsUrl } = require('./util');

const testFunctions = Object.assign(Object.create(null), {
  describe: true,
  it: true,
  test: true,
});

const matchesTestFunction = object => object && testFunctions[object.name];

const isCallToFocusedTestFunction = object =>
  object && object.name[0] === 'f' && testFunctions[object.name.substring(1)];

const isPropertyNamedOnly = property =>
  property && (property.name === 'only' || property.value === 'only');

const isCallToTestOnlyFunction = callee =>
  matchesTestFunction(callee.object) && isPropertyNamedOnly(callee.property);

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      focusedTest: 'Unexpected focused test.',
    },
    schema: [],
  },
  create: context => ({
    CallExpression(node) {
      const { callee } = node;

      if (callee.type === 'MemberExpression') {
        if (
          callee.object.type === 'Identifier' &&
          isCallToFocusedTestFunction(callee.object)
        ) {
          context.report({ messageId: 'focusedTest', node: callee.object });
          return;
        }

        if (
          callee.object.type === 'MemberExpression' &&
          isCallToTestOnlyFunction(callee.object)
        ) {
          context.report({
            messageId: 'focusedTest',
            node: callee.object.property,
          });
          return;
        }

        if (isCallToTestOnlyFunction(callee)) {
          context.report({ messageId: 'focusedTest', node: callee.property });
          return;
        }
      }

      if (callee.type === 'Identifier' && isCallToFocusedTestFunction(callee)) {
        context.report({ messageId: 'focusedTest', node: callee });
      }
    },
  }),
};
