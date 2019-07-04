'use strict';

const { getDocsUrl } = require('./util');

const reportOnViolation = (context, node) => {
  const lineLimit =
    context.options[0] && Number.isFinite(context.options[0].maxSize)
      ? context.options[0].maxSize
      : 50;
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  const lineCount = endLine - startLine;

  if (lineCount > lineLimit) {
    context.report({
      messageId: lineLimit === 0 ? 'noSnapshot' : 'tooLongSnapshots',
      data: { lineLimit, lineCount },
      node,
    });
  }
};

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      noSnapshot: '`{{ lineCount }}`s should begin with lowercase',
      tooLongSnapshots:
        'Expected Jest snapshot to be smaller than {{ lineLimit }} lines but was {{ lineCount }} lines long',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxSize: {
            type: 'number',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    if (context.getFilename().endsWith('.snap')) {
      return {
        ExpressionStatement(node) {
          reportOnViolation(context, node);
        },
      };
    } else if (context.getFilename().endsWith('.js')) {
      return {
        CallExpression(node) {
          const propertyName =
            node.callee.property && node.callee.property.name;
          if (
            propertyName === 'toMatchInlineSnapshot' ||
            propertyName === 'toThrowErrorMatchingInlineSnapshot'
          ) {
            reportOnViolation(context, node);
          }
        },
      };
    }

    return {};
  },
};
