// TODO: rename to utils.ts when TS migration is complete
import { basename } from 'path';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { version } from '../../package.json';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

const REPO_URL = 'https://github.com/jest-community/eslint-plugin-jest';

export const createRule = ESLintUtils.RuleCreator(name => {
  const ruleName = basename(name, '.ts');
  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});

enum DescribeAlias {
  'describe',
  'fdescribe',
  'xdescribe',
}

export const isFunction = (node: TSESTree.Node): boolean =>
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.ArrowFunctionExpression;

export const isDescribe = (node: TSESTree.CallExpression): boolean => {
  return (
    (node.callee.type === AST_NODE_TYPES.Identifier &&
      node.callee.name in DescribeAlias) ||
    (node.callee.type === AST_NODE_TYPES.MemberExpression &&
      node.callee.object.type === AST_NODE_TYPES.Identifier &&
      node.callee.object.name in DescribeAlias)
  );
};
