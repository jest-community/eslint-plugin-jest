import { getDocsUrl } from './util';

export default {
  meta: {
    docs: {
      description: 'Disallow snapshots',
      uri: getDocsUrl(__filename),
    },
    messages: {
      noSnapshots:
        'Do not use {{ method }} or related methods that generate snapshots.',
    },
  },

  create(context) {
    return {
      CallExpression({ callee: { property } }) {
        if (!property) {
          return;
        }

        if (isSnapshot(property.name)) {
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
  ].includes(name);
}
