import { getDocsUrl, isHook } from './util';

export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      unexpectedHook: "Unexpected '{{ hookName }}' hook",
    },
  },
  schema: [
    {
      type: 'object',
      properties: {
        allow: {
          type: 'array',
          contains: ['beforeAll', 'beforeEach', 'afterAll', 'afterEach'],
        },
      },
      additionalProperties: false,
    },
  ],
  create(context) {
    const whitelistedHookNames = (
      context.options[0] || { allow: [] }
    ).allow.reduce((hashMap, value) => {
      hashMap[value] = true;
      return hashMap;
    }, Object.create(null));

    const isWhitelisted = node => whitelistedHookNames[node.callee.name];

    return {
      CallExpression(node) {
        if (isHook(node) && !isWhitelisted(node)) {
          context.report({
            node,
            messageId: 'unexpectedHook',
            data: { hookName: node.callee.name },
          });
        }
      },
    };
  },
};
