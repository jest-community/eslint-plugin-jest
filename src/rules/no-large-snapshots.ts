import { isAbsolute } from 'path';
import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  createRule,
  getAccessorValue,
  isExpectCall,
  isExpectMember,
  parseExpectCall,
} from './utils';

interface RuleOptions {
  maxSize?: number;
  inlineMaxSize?: number;
  allowedSnapshots?: Record<string, Array<string | RegExp>>;
}

type MessageId = 'noSnapshot' | 'tooLongSnapshots';

type RuleContext = TSESLint.RuleContext<MessageId, [RuleOptions]>;

const reportOnViolation = (
  context: RuleContext,
  node: TSESTree.CallExpression | TSESTree.ExpressionStatement,
  { maxSize: lineLimit = 50, allowedSnapshots = {} }: RuleOptions,
) => {
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  const lineCount = endLine - startLine;

  const allPathsAreAbsolute = Object.keys(allowedSnapshots).every(isAbsolute);

  if (!allPathsAreAbsolute) {
    throw new Error(
      'All paths for allowedSnapshots must be absolute. You can use JS config and `path.resolve`',
    );
  }

  let isAllowed = false;

  if (
    node.type === AST_NODE_TYPES.ExpressionStatement &&
    'left' in node.expression &&
    isExpectMember(node.expression.left)
  ) {
    const fileName = context.getFilename();
    const allowedSnapshotsInFile = allowedSnapshots[fileName];

    if (allowedSnapshotsInFile) {
      const snapshotName = getAccessorValue(node.expression.left.property);

      isAllowed = allowedSnapshotsInFile.some(name => {
        if (name instanceof RegExp) {
          return name.test(snapshotName);
        }

        return snapshotName === name;
      });
    }
  }

  if (!isAllowed && lineCount > lineLimit) {
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
          inlineMaxSize: {
            type: 'number',
          },
          allowedSnapshots: {
            type: 'object',
            additionalProperties: { type: 'array' },
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
    }

    return {
      CallExpression(node) {
        if (!isExpectCall(node)) {
          return;
        }

        const { matcher } = parseExpectCall(node);

        if (matcher?.node.parent?.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        if (
          [
            'toMatchInlineSnapshot',
            'toThrowErrorMatchingInlineSnapshot',
          ].includes(matcher.name)
        ) {
          reportOnViolation(context, matcher.node.parent, {
            ...options,
            maxSize: options.inlineMaxSize ?? options.maxSize,
          });
        }
      },
    };
  },
});
