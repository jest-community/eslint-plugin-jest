// TODO: rename to utils.ts when TS migration is complete
import { basename } from 'path';
import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { version } from '../../package.json';

const REPO_URL = 'https://github.com/jest-community/eslint-plugin-jest';

export const createRule = ESLintUtils.RuleCreator(name => {
  const ruleName = basename(name, '.ts');
  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});

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

export type JestFunctionName = DescribeAlias | TestCaseName | HookName;

export interface JestFunctionIdentifier<FunctionName extends JestFunctionName>
  extends TSESTree.Identifier {
  name: FunctionName;
}

export interface JestFunctionMemberExpression<
  FunctionName extends JestFunctionName
> extends TSESTree.MemberExpression {
  object: JestFunctionIdentifier<FunctionName>;
}

export interface JestFunctionCallExpressionWithMemberExpressionCallee<
  FunctionName extends JestFunctionName
> extends TSESTree.CallExpression {
  callee: JestFunctionMemberExpression<FunctionName>;
}

export interface JestFunctionCallExpressionWithIdentifierCallee<
  FunctionName extends JestFunctionName
> extends TSESTree.CallExpression {
  callee: JestFunctionIdentifier<FunctionName>;
}

export type JestFunctionCallExpression<
  FunctionName extends JestFunctionName = JestFunctionName
> =
  | JestFunctionCallExpressionWithMemberExpressionCallee<FunctionName>
  | JestFunctionCallExpressionWithIdentifierCallee<FunctionName>;

export const getNodeName = (node: TSESTree.Node): string | null => {
  function joinNames(a?: string | null, b?: string | null): string | null {
    return a && b ? `${a}.${b}` : null;
  }

  switch (node.type) {
    case AST_NODE_TYPES.Identifier:
      return node.name;
    case AST_NODE_TYPES.Literal:
      return `${node.value}`;
    case AST_NODE_TYPES.TemplateLiteral:
      if (node.expressions.length === 0) return node.quasis[0].value.cooked;
      break;
    case AST_NODE_TYPES.MemberExpression:
      return joinNames(getNodeName(node.object), getNodeName(node.property));
  }

  return null;
};

export type FunctionExpression =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

export const isFunction = (node: TSESTree.Node): node is FunctionExpression =>
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.ArrowFunctionExpression;

export const isHook = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpressionWithIdentifierCallee<HookName> => {
  return (
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name in HookName
  );
};

export const isTestCase = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<TestCaseName> => {
  return (
    (node.callee.type === AST_NODE_TYPES.Identifier &&
      node.callee.name in TestCaseName) ||
    (node.callee.type === AST_NODE_TYPES.MemberExpression &&
      node.callee.object.type === AST_NODE_TYPES.Identifier &&
      node.callee.object.name in TestCaseName)
  );
};

export const isDescribe = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<DescribeAlias> => {
  return (
    (node.callee.type === AST_NODE_TYPES.Identifier &&
      node.callee.name in DescribeAlias) ||
    (node.callee.type === AST_NODE_TYPES.MemberExpression &&
      node.callee.object.type === AST_NODE_TYPES.Identifier &&
      node.callee.object.name in DescribeAlias)
  );
};

export const isLiteralNode = (node: {
  type: AST_NODE_TYPES;
}): node is TSESTree.Literal => node.type === AST_NODE_TYPES.Literal;

const collectReferences = (scope: TSESLint.Scope.Scope) => {
  const locals = new Set();
  const unresolved = new Set();

  let currentScope: TSESLint.Scope.Scope | null = scope;

  while (currentScope !== null) {
    for (const ref of currentScope.variables) {
      const isReferenceDefined = ref.defs.some(def => {
        return def.type !== 'ImplicitGlobalVariable';
      });

      if (isReferenceDefined) {
        locals.add(ref.name);
      }
    }

    for (const ref of currentScope.through) {
      unresolved.add(ref.identifier.name);
    }

    currentScope = currentScope.upper;
  }

  return { locals, unresolved };
};

export const scopeHasLocalReference = (
  scope: TSESLint.Scope.Scope,
  referenceName: string,
) => {
  const references = collectReferences(scope);
  return (
    // referenceName was found as a local variable or function declaration.
    references.locals.has(referenceName) ||
    // referenceName was not found as an unresolved reference,
    // meaning it is likely not an implicit global reference.
    !references.unresolved.has(referenceName)
  );
};
