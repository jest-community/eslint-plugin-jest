import parser from '@typescript-eslint/parser';
import type { Config } from 'eslint-remote-tester';
import {
  getPathIgnorePattern,
  getRepositories,
} from 'eslint-remote-tester-repositories';
import plugin from './src';

const config: Config = {
  repositories: getRepositories({ randomize: true }),
  pathIgnorePattern: getPathIgnorePattern(),
  extensions: ['js', 'jsx', 'ts', 'tsx'],
  concurrentTasks: 3,
  cache: false,
  logLevel: 'info',
  // @ts-expect-error todo: https://github.com/AriPerkkio/eslint-remote-tester/pull/628
  eslintConfig: [
    plugin.configs['flat/all'],
    { languageOptions: { parser, parserOptions: { project: true } } },
  ],
};

export default config;
