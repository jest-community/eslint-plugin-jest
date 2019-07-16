import { getDocsUrl } from './util';

const testFunctions = new Set(['describe', 'it', 'test']);

const matchesTestFunction = object => object && testFunctions.has(object.name);

const isCallToFocusedTestFunction = object =>
  object &&
  object.name[0] === 'f' &&
  testFunctions.has(object.name.substring(1));

const isPropertyNamedOnly = property =>
  property && (property.name === 'only' || property.value === 'only');

const isCallToTestOnlyFunction = callee =>
  matchesTestFunction(callee.object) && isPropertyNamedOnly(callee.property);

export default {
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
