'use strict';

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
      url:
        'https://github.com/jest-community/eslint-plugin-jest/blob/master/docs/rules/no-focused-tests.md',
    },
  },
  create: context => ({
    CallExpression(node) {
      const callee = node.callee;
      if (!callee) {
        return;
      }

      if (
        callee.type === 'MemberExpression' &&
        isCallToTestOnlyFunction(callee)
      ) {
        context.report({
          message: 'Unexpected focused test.',
          node: callee.property,
        });
        return;
      }

      if (callee.type === 'Identifier' && isCallToFocusedTestFunction(callee)) {
        context.report({
          message: 'Unexpected focused test.',
          node: callee,
        });
        return;
      }
    },
  }),
};
