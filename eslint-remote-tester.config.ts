import parser from '@typescript-eslint/parser';
import type { Config } from 'eslint-remote-tester';
import {
  getPathIgnorePattern,
  getRepositories,
} from 'eslint-remote-tester-repositories';
import plugin from './src';

// these repos often cause ERR_WORKER_OUT_OF_MEMORY errors, probably because
// they are large typescript repositories which cause our type-based rules
// to use a lot of memory
const reposToIgnore = new Set<string>([
  'trezor/trezor-suite',
  'tannerlinsley/react-location',
  'w-okada/image-analyze-workers',
  'hubmapconsortium/vitessce',
  'magiclabs/magic-js',
  'umbraco/Umbraco.UI',
  'LaunchMenu/LaunchMenu',
]);

const config: Config = {
  repositories: getRepositories({ randomize: true }).filter(repo => {
    return !reposToIgnore.has(repo);
  }),
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
