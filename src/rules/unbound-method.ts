import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createRule,
  findTopMostCallExpression,
  getAccessorValue,
  parseJestFnCall,
} from './utils';

const toThrowMatchers = [
  'toThrow',
  'toThrowError',
  'toThrowErrorMatchingSnapshot',
  'toThrowErrorMatchingInlineSnapshot',
];

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
      unbound: DEFAULT_MESSAGE,
      unboundWithoutThisAnnotation: DEFAULT_MESSAGE,
    },
    schema: [],
    type: 'problem',
    ...baseRule?.meta,
    docs: {
      description:
        'Enforce unbound methods are called with their expected scope',
      requiresTypeChecking: true,
      ...baseRule?.meta.docs,
    },
  },
  create(context) {
    const baseSelectors = baseRule?.create(context);

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

          if (jestFnCall?.type === 'expect') {
            const { matcher } = jestFnCall;

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
