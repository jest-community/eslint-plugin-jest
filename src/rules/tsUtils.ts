// TODO: rename to utils.ts when TS migration is complete
import { basename } from 'path';
import {
  AST_NODE_TYPES,
  ESLintUtils,
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

interface JestFunctionIdentifier<FunctionName extends JestFunctionName>
  extends TSESTree.Identifier {
  name: FunctionName;
}

export interface JestFunctionCallExpression<
  FunctionName extends JestFunctionName = JestFunctionName
> extends TSESTree.CallExpression {
  callee: JestFunctionIdentifier<FunctionName>;
}

export type FunctionExpression =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

export const isFunction = (node: TSESTree.Node): node is FunctionExpression =>
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.ArrowFunctionExpression;

/* istanbul ignore next */
export const isHook = (
  node: TSESTree.CallExpression,
): node is JestFunctionCallExpression<HookName> => {
  return (
    (node.callee.type === AST_NODE_TYPES.Identifier &&
      node.callee.name in HookName) ||
    (node.callee.type === AST_NODE_TYPES.MemberExpression &&
      node.callee.object.type === AST_NODE_TYPES.Identifier &&
      node.callee.object.name in HookName)
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
