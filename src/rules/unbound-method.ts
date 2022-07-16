import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import { createRule, getAccessorValue, parseJestFnCall } from './utils';

const toThrowMatchers = [
  'toThrow',
  'toThrowError',
  'toThrowErrorMatchingSnapshot',
  'toThrowErrorMatchingInlineSnapshot',
];

const findTopMostCallExpression = (
  node: TSESTree.CallExpression,
): TSESTree.CallExpression => {
  let topMostCallExpression = node;
  let { parent } = node;

  while (parent) {
    if (parent.type === AST_NODE_TYPES.CallExpression) {
      topMostCallExpression = parent;

      parent = parent.parent;

      continue;
    }

    if (parent.type !== AST_NODE_TYPES.MemberExpression) {
      break;
    }

    parent = parent.parent;
  }

  return topMostCallExpression;
};

const baseRule = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TSESLintPlugin = require('@typescript-eslint/eslint-plugin');

    return TSESLintPlugin.rules['unbound-method'] as TSESLint.RuleModule<
      MessageIds,
      Options
    >;
  } catch (e: unknown) {
    const error = e as { code: string };

    if (error.code === 'MODULE_NOT_FOUND') {
      return null;
    }

    throw error;
  }
})();

const tryCreateBaseRule = (
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
) => {
  try {
    return baseRule?.create(context);
  } catch {
    return null;
  }
};

interface Config {
  ignoreStatic: boolean;
}

export type Options = [Config];

export type MessageIds = 'unbound' | 'unboundWithoutThisAnnotation';

const DEFAULT_MESSAGE = 'This rule requires `@typescript-eslint/eslint-plugin`';

export default createRule<Options, MessageIds>({
  defaultOptions: [{ ignoreStatic: false }],
  ...baseRule,
  name: __filename,
  meta: {
    messages: {
      // eslint-disable-next-line eslint-plugin/no-unused-message-ids
      unbound: DEFAULT_MESSAGE,
      // eslint-disable-next-line eslint-plugin/no-unused-message-ids
      unboundWithoutThisAnnotation: DEFAULT_MESSAGE,
    },
    schema: [],
    type: 'problem',
    ...baseRule?.meta,
    docs: {
      category: 'Best Practices',
      description:
        'Enforce unbound methods are called with their expected scope',
      requiresTypeChecking: true,
      ...baseRule?.meta.docs,
      recommended: false,
    },
  },
  create(context) {
    const baseSelectors = tryCreateBaseRule(context);

    if (!baseSelectors) {
      return {};
    }

    return {
      ...baseSelectors,
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (node.parent?.type === AST_NODE_TYPES.CallExpression) {
          const jestFnCall = parseJestFnCall(
            findTopMostCallExpression(node.parent),
            context,
          );

          if (jestFnCall?.type === 'expect' && jestFnCall.members.length > 0) {
            const matcher = jestFnCall.members[jestFnCall.members.length - 1];

            if (!toThrowMatchers.includes(getAccessorValue(matcher))) {
              return;
            }
          }
        }

        baseSelectors.MemberExpression?.(node);
      },
    };
  },
});
