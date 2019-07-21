import { getDocsUrl } from './util';

export default {
  meta: {
    docs: {
      description: 'Disallow snapshots',
      uri: getDocsUrl(__filename),
    },
    messages: {
      noSnapshots:
        'Do not use {{method}} or related methods that generate snapshots.',
    },
  },

  create(context) {
    return {
      CallExpression({ callee: { property } }) {
        if (isSnapshot(property && property.name)) {
          context.report({
            messageId: 'noSnapshots',
            node: property,
            data: { method: property.name },
          });
        }
      },
    };
  },
};

function isSnapshot(name) {
  return [
    'toMatchSnapshot',
    'toMatchInlineSnapshot',
    'toThrowErrorMatchingSnapshot',
    'toThrowErrorMatchingInlineSnapshot',
  ].some(method => method === name);
}
