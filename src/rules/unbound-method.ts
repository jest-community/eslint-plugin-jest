import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule, isExpectCall, parseExpectCall } from './utils';

const toThrowMatchers = [
  'toThrow',
  'toThrowError',
  'toThrowErrorMatchingSnapshot',
  'toThrowErrorMatchingInlineSnapshot',
];

const isJestExpectCall = (node: TSESTree.CallExpression) => {
  if (!isExpectCall(node)) {
    return false;
  }

  const { matcher } = parseExpectCall(node);

  return !toThrowMatchers.includes(matcher?.name ?? '');
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

export type MessageIds = 'unbound';

export default createRule<Options, MessageIds>({
  defaultOptions: [{ ignoreStatic: false }],
  ...baseRule,
  name: __filename,
  meta: {
    messages: {
      unbound: 'This rule requires `@typescript-eslint/eslint-plugin`',
    },
    schema: [],
    type: 'problem',
    ...baseRule?.meta,
    docs: {
      category: 'Best Practices',
      description:
        'Enforces unbound methods are called with their expected scope',
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

    let inExpectCall = false;

    return {
      ...baseSelectors,
      CallExpression(node: TSESTree.CallExpression): void {
        inExpectCall = isJestExpectCall(node);
      },
      'CallExpression:exit'(node: TSESTree.CallExpression): void {
        if (inExpectCall && isJestExpectCall(node)) {
          inExpectCall = false;
        }
      },
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (inExpectCall) {
          return;
        }

        baseSelectors.MemberExpression?.(node);
      },
    };
  },
});
