import parser from '@typescript-eslint/parser';
import type { Config } from 'eslint-remote-tester';
import {
  getPathIgnorePattern,
  getRepositories,
} from 'eslint-remote-tester-repositories';
import plugin from './src';

const config: Config = {
  repositories: getRepositories({ randomize: true }).slice(0, 1),
  pathIgnorePattern: getPathIgnorePattern(),
  extensions: ['js', 'jsx', 'ts', 'tsx'],
  concurrentTasks: 3,
  cache: false,
  logLevel: 'info',
  // @ts-expect-error todo: https://github.com/AriPerkkio/eslint-remote-tester/pull/628
  eslintConfig: [
    plugin.configs['flat/all'],
    { languageOptions: { parser } },
    {
      rules: {
        // these rules require type information, which is not really feasible
        // when linting a bunch of randomly picked open-source js & ts projects
        //
        // todo: try to see if we can actually get these working
        'jest/no-error-equal': 'off',
        'jest/no-unnecessary-assertion': 'off',
        'jest/unbound-method': 'off',
        'jest/valid-expect-with-promise': 'off',
      },
    },
  ],
};

export default config;
