import { parse as parsePath } from 'path';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { version } from '../../../package.json';

const REPO_URL = 'https://github.com/jest-community/eslint-plugin-jest';

export const createRule = ESLintUtils.RuleCreator(name => {
  const ruleName = parsePath(name).name;

  return `${REPO_URL}/blob/v${version}/docs/rules/${ruleName}.md`;
});
