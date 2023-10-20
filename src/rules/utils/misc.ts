import { parse as parsePath } from 'path';
import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { version } from '../../../package.json';
import {
  type AccessorNode,
  getAccessorValue,
  isSupportedAccessor,
} from './accessors';
import { followTypeAssertionChain } from './followTypeAssertionChain';
import { type ParsedExpectFnCall, isTypeOfJestFnCall } from './parseJestFnCall';

const REPO_URL = 'https://github.com/jest-community/eslint-plugin-jest';

export const createRule = ESLintUtils.RuleCreator(name => {
  const ruleName = parsePath(name).name;

  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});

/**
 * Represents a `MemberExpression` with a "known" `property`.
 */
export interface KnownMemberExpression<Name extends string = string>
  extends TSESTree.MemberExpressionComputedName {
  property: AccessorNode<Name>;
}

/**
 * Represents a `CallExpression` with a "known" `property` accessor.
 *
 * i.e `KnownCallExpression<'includes'>` represents `.includes()`.
 */
export interface KnownCallExpression<Name extends string = string>
  extends TSESTree.CallExpression {
  callee: CalledKnownMemberExpression<Name>;
}

/**
 * Represents a `MemberExpression` with a "known" `property`, that is called.
 *
 * This is `KnownCallExpression` from the perspective of the `MemberExpression` node.
 */
interface CalledKnownMemberExpression<Name extends string = string>
  extends KnownMemberExpression<Name> {
  parent: KnownCallExpression<Name>;
}

/**
 * Represents a `CallExpression` with a single argument.
 */
export interface CallExpressionWithSingleArgument<
  Argument extends
    TSESTree.CallExpression['arguments'][number] = TSESTree.CallExpression['arguments'][number],
> extends TSESTree.CallExpression {
  arguments: [Argument];
}

/**
 * Guards that the given `call` has only one `argument`.
 *
 * @param {CallExpression} call
 *
 * @return {call is CallExpressionWithSingleArgument}
 */
export const hasOnlyOneArgument = (
  call: TSESTree.CallExpression,
): call is CallExpressionWithSingleArgument => call.arguments.length === 1;

export enum DescribeAlias {
  'describe' = 'describe',
  'fdescribe' = 'fdescribe',
  'xdescribe' = 'xdescribe',
}

export enum TestCaseName {
  'fit' = 'fit',
  'it' = 'it',
  'test' = 'test',
  'xit' = 'xit',
  'xtest' = 'xtest',
}

export enum HookName {
  'beforeAll' = 'beforeAll',
  'beforeEach' = 'beforeEach',
  'afterAll' = 'afterAll',
  'afterEach' = 'afterEach',
}

export enum ModifierName {
  not = 'not',
  rejects = 'rejects',
  resolves = 'resolves',
}

export enum EqualityMatcher {
  toBe = 'toBe',
  toEqual = 'toEqual',
  toStrictEqual = 'toStrictEqual',
}

const joinNames = (a: string | null, b: string | null): string | null =>
  a && b ? `${a}.${b}` : null;

export function getNodeName(node: TSESTree.Node): string | null {
  if (isSupportedAccessor(node)) {
    return getAccessorValue(node);
  }

  switch (node.type) {
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return getNodeName(node.tag);
    case AST_NODE_TYPES.MemberExpression:
      return joinNames(getNodeName(node.object), getNodeName(node.property));
    case AST_NODE_TYPES.NewExpression:
    case AST_NODE_TYPES.CallExpression:
      return getNodeName(node.callee);
  }

  return null;
}

export type FunctionExpression =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

export const isFunction = (node: TSESTree.Node): node is FunctionExpression =>
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.ArrowFunctionExpression;

export const getTestCallExpressionsFromDeclaredVariables = (
  declaredVariables: readonly TSESLint.Scope.Variable[],
  context: TSESLint.RuleContext<string, unknown[]>,
): TSESTree.CallExpression[] => {
  return declaredVariables.reduce<TSESTree.CallExpression[]>(
    (acc, { references }) =>
      acc.concat(
        references
          .map(({ identifier }) => identifier.parent)
          .filter(
            (node): node is TSESTree.CallExpression =>
              node?.type === AST_NODE_TYPES.CallExpression &&
              isTypeOfJestFnCall(node, context, ['test']),
          ),
      ),
    [],
  );
};

/**
 * Replaces an accessor node with the given `text`, surrounding it in quotes if required.
 *
 * This ensures that fixes produce valid code when replacing both dot-based and
 * bracket-based property accessors.
 */
export const replaceAccessorFixer = (
  fixer: TSESLint.RuleFixer,
  node: AccessorNode,
  text: string,
) => {
  return fixer.replaceText(
    node,
    node.type === AST_NODE_TYPES.Identifier ? text : `'${text}'`,
  );
};

export const removeExtraArgumentsFixer = (
  fixer: TSESLint.RuleFixer,
  context: TSESLint.RuleContext<string, unknown[]>,
  func: TSESTree.CallExpression,
  from: number,
): TSESLint.RuleFix => {
  const firstArg = func.arguments[from];
  const lastArg = func.arguments[func.arguments.length - 1];

  const sourceCode = getSourceCode(context);
  let tokenAfterLastParam = sourceCode.getTokenAfter(lastArg)!;

  if (tokenAfterLastParam.value === ',') {
    tokenAfterLastParam = sourceCode.getTokenAfter(tokenAfterLastParam)!;
  }

  return fixer.removeRange([firstArg.range[0], tokenAfterLastParam.range[0]]);
};

export const findTopMostCallExpression = (
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

export const isBooleanLiteral = (
  node: TSESTree.Node,
): node is TSESTree.BooleanLiteral =>
  node.type === AST_NODE_TYPES.Literal && typeof node.value === 'boolean';

export const getFirstMatcherArg = (
  expectFnCall: ParsedExpectFnCall,
): TSESTree.SpreadElement | TSESTree.Expression => {
  const [firstArg] = expectFnCall.args;

  if (firstArg.type === AST_NODE_TYPES.SpreadElement) {
    return firstArg;
  }

  return followTypeAssertionChain(firstArg);
};

export const getSourceCode = (
  context: TSESLint.RuleContext<string, unknown[]>,
) => {
  return 'sourceCode' in context
    ? (context.sourceCode as TSESLint.SourceCode)
    : context.getSourceCode();
};

export const getScope = (
  context: TSESLint.RuleContext<string, unknown[]>,
  node: TSESTree.Node,
) => {
  const sourceCode = getSourceCode(context);

  if ('getScope' in sourceCode) {
    return sourceCode.getScope(node);
  }

  return context.getScope();
};

export const getAncestors = (
  context: TSESLint.RuleContext<string, unknown[]>,
  node: TSESTree.Node,
) => {
  const sourceCode = getSourceCode(context);

  if ('getAncestors' in sourceCode) {
    return sourceCode.getAncestors(node);
  }

  return context.getAncestors();
};

export const getDeclaredVariables = (
  context: TSESLint.RuleContext<string, unknown[]>,
  node: TSESTree.Node,
) => {
  const sourceCode = getSourceCode(context);

  if ('getDeclaredVariables' in sourceCode) {
    return sourceCode.getDeclaredVariables(node);
  }

  return context.getDeclaredVariables(node);
};
