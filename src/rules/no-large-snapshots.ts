import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { isAbsolute } from 'path';
import {
  createRule,
  getAccessorValue,
  isExpectMember,
  isSupportedAccessor,
} from './utils';

interface RuleOptions {
  maxSize?: number;
  whitelistedSnapshots?: Record<string, Array<string | RegExp>>;
}

type MessageId = 'noSnapshot' | 'tooLongSnapshots';

type RuleContext = TSESLint.RuleContext<MessageId, [RuleOptions]>;

const reportOnViolation = (
  context: RuleContext,
  node: TSESTree.CallExpression | TSESTree.ExpressionStatement,
  { maxSize: lineLimit = 50, whitelistedSnapshots = {} }: RuleOptions,
) => {
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  const lineCount = endLine - startLine;

  const allPathsAreAbsolute = Object.keys(whitelistedSnapshots).every(
    isAbsolute,
  );

  if (!allPathsAreAbsolute) {
    throw new Error(
      'All paths for whitelistedSnapshots must be absolute. You can use JS config and `path.resolve`',
    );
  }

  let isWhitelisted = false;

  if (
    whitelistedSnapshots &&
    node.type === AST_NODE_TYPES.ExpressionStatement &&
    'left' in node.expression &&
    isExpectMember(node.expression.left)
  ) {
    const fileName = context.getFilename();
    const whitelistedSnapshotsInFile = whitelistedSnapshots[fileName];

    if (whitelistedSnapshotsInFile) {
      const snapshotName = getAccessorValue(node.expression.left.property);
      isWhitelisted = whitelistedSnapshotsInFile.some(name => {
        if (name instanceof RegExp) {
          return name.test(snapshotName);
        }

        return snapshotName;
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

export default createRule<[RuleOptions], MessageId>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'disallow large snapshots',
      recommended: false,
    },
    messages: {
      noSnapshot: '`{{ lineCount }}`s should begin with lowercase',
      tooLongSnapshots:
        'Expected Jest snapshot to be smaller than {{ lineLimit }} lines but was {{ lineCount }} lines long',
    },
    type: 'suggestion',
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
  defaultOptions: [{}],
  create(context, [options]) {
    if (context.getFilename().endsWith('.snap')) {
      return {
        ExpressionStatement(node) {
          reportOnViolation(context, node, options);
        },
      };
    } else if (context.getFilename().endsWith('.js')) {
      return {
        CallExpression(node) {
          if (
            'property' in node.callee &&
            (isSupportedAccessor(
              node.callee.property,
              'toMatchInlineSnapshot',
            ) ||
              isSupportedAccessor(
                node.callee.property,
                'toThrowErrorMatchingInlineSnapshot',
              ))
          ) {
            reportOnViolation(context, node, options);
          }
        },
      };
    }

    return {};
  },
});
