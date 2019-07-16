'use strict';

const { getDocsUrl, getStringValue } = require('./util');

const path = require('path');

const reportOnViolation = (context, node) => {
  const lineLimit =
    context.options[0] && Number.isFinite(context.options[0].maxSize)
      ? context.options[0].maxSize
      : 50;
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  const lineCount = endLine - startLine;
  const whitelistedSnapshots =
    context.options &&
    context.options[0] &&
    context.options[0].whitelistedSnapshots;

  const allPathsAreAbsolute = Object.keys(whitelistedSnapshots || {}).every(
    path.isAbsolute,
  );

  if (!allPathsAreAbsolute) {
    throw new Error(
      'All paths for whitelistedSnapshots must be absolute. You can use JS config and `path.resolve`',
    );
  }

  let isWhitelisted = false;

  if (whitelistedSnapshots) {
    const fileName = context.getFilename();
    const whitelistedSnapshotsInFile = whitelistedSnapshots[fileName];

    if (whitelistedSnapshotsInFile) {
      const snapshotName = getStringValue(node.expression.left.property);
      isWhitelisted = whitelistedSnapshotsInFile.some(name => {
        if (name.test && typeof name.test === 'function') {
          return name.test(snapshotName);
        } else {
          return name === snapshotName;
        }
      });
    }
  }

  if (!isWhitelisted && lineCount > lineLimit) {
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
          whitelistedSnapshots: {
            type: 'object',
            patternProperties: {
              '.*': { type: 'array' },
            },
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
