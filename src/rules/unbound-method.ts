import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createRule,
  findTopMostCallExpression,
  getAccessorValue,
  isIdentifier,
  isSupportedAccessor,
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
      ...baseRule?.meta.docs,
    },
  },
  create(context) {
    const baseSelectors = baseRule?.create(context);

    if (!baseSelectors) {
      return {};
    }

    /**
     * Checks if a MemberExpression is an argument to a `jest.mocked()` call.
     * This handles cases like `jest.mocked(service.method)` where `service.method`
     * should not be flagged as an unbound method.
     */
    const isArgumentToJestMocked = (
      node: TSESTree.MemberExpression,
    ): boolean => {
      // Check if the immediate parent is a CallExpression
      if (node.parent?.type !== AST_NODE_TYPES.CallExpression) {
        return false;
      }

      const parentCall = node.parent;

      // Check if this node is an argument to the call
      if (!parentCall.arguments.some(arg => arg === node)) {
        return false;
      }

      // Check if the call is jest.mocked() by examining the callee
      if (
        parentCall.callee.type === AST_NODE_TYPES.MemberExpression &&
        isSupportedAccessor(parentCall.callee.object) &&
        isSupportedAccessor(parentCall.callee.property)
      ) {
        const objectName = getAccessorValue(parentCall.callee.object);
        const propertyName = getAccessorValue(parentCall.callee.property);

        if (objectName === 'jest' && propertyName === 'mocked') {
          return true;
        }
      }

      // Also try using parseJestFnCall as a fallback
      const jestFnCall = parseJestFnCall(
        findTopMostCallExpression(parentCall),
        context,
      );

      return (
        jestFnCall?.type === 'jest' &&
        jestFnCall.members.length >= 1 &&
        isIdentifier(jestFnCall.members[0], 'mocked')
      );
    };

    /**
     * Checks if a MemberExpression is accessing `.mock` property on a
     * `jest.mocked()` result. This handles cases like:
     * - `jest.mocked(service.method).mock.calls[0][0]`
     * - `jest.mocked(service.method).mock.calls`
     */
    const isAccessingMockProperty = (
      node: TSESTree.MemberExpression,
    ): boolean => {
      // Check if we're accessing `.mock` property
      if (!isSupportedAccessor(node.property)) {
        return false;
      }

      const propertyName = getAccessorValue(node.property);

      if (propertyName !== 'mock') {
        return false;
      }

      // Traverse up the chain to find if the object is a jest.mocked() call
      let current: TSESTree.Node = node.object;

      while (current) {
        if (current.type === AST_NODE_TYPES.CallExpression) {
          const jestFnCall = parseJestFnCall(
            findTopMostCallExpression(current),
            context,
          );

          if (
            jestFnCall?.type === 'jest' &&
            jestFnCall.members.length >= 1 &&
            isIdentifier(jestFnCall.members[0], 'mocked')
          ) {
            return true;
          }
        }

        // Continue traversing up if the current node is part of a member chain
        if (current.type === AST_NODE_TYPES.MemberExpression) {
          current = current.object;
        } else {
          break;
        }
      }

      return false;
    };

    return {
      ...baseSelectors,
      MemberExpression(node: TSESTree.MemberExpression): void {
        // Check if this MemberExpression is an argument to jest.mocked()
        if (isArgumentToJestMocked(node)) {
          return;
        }

        // Check if accessing .mock property on jest.mocked() result
        if (isAccessingMockProperty(node)) {
          return;
        }

        if (node.parent?.type === AST_NODE_TYPES.CallExpression) {
          const jestFnCall = parseJestFnCall(
            findTopMostCallExpression(node.parent),
            context,
          );

          if (
            jestFnCall?.type === 'jest' &&
            jestFnCall.members.length >= 1 &&
            isIdentifier(jestFnCall.members[0], 'mocked')
          ) {
            return;
          }

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
