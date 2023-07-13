import { readdirSync } from 'fs';
import { join, parse } from 'path';
import type { TSESLint } from '@typescript-eslint/utils';
import globals from './globals.json';
import * as snapshotProcessor from './processors/snapshot-processor';

type RuleModule = TSESLint.RuleModule<string, unknown[]> & {
  meta: Required<Pick<TSESLint.RuleMetaData<string>, 'docs'>>;
};

// copied from https://github.com/babel/babel/blob/d8da63c929f2d28c401571e2a43166678c555bc4/packages/babel-helpers/src/helpers.js#L602-L606
/* istanbul ignore next */
const interopRequireDefault = (obj: any): { default: any } =>
  obj && obj.__esModule ? obj : { default: obj };

const importDefault = (moduleName: string) =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  interopRequireDefault(require(moduleName)).default;

const rulesDir = join(__dirname, 'rules');
const excludedFiles = ['__tests__', 'detectJestVersion', 'utils'];

const rules = Object.fromEntries(
  readdirSync(rulesDir)
    .map(rule => parse(rule).name)
    .filter(rule => !excludedFiles.includes(rule))
    .map(rule => [rule, importDefault(join(rulesDir, rule)) as RuleModule]),
);

const recommendedRules = Object.fromEntries(
  Object.entries(rules)
    .filter(([, rule]) => rule.meta.docs.recommended)
    .map(([name, rule]) => [
      `jest/${name}`,
      rule.meta.docs.recommended as TSESLint.Linter.RuleLevel,
    ]),
);

const allRules = Object.fromEntries<TSESLint.Linter.RuleLevel>(
  Object.entries(rules)
    .filter(([, rule]) => !rule.meta.deprecated)
    .map(([name]) => [`jest/${name}`, 'error']),
);

const createConfig = (rules: Record<string, TSESLint.Linter.RuleLevel>) => ({
  plugins: ['jest'],
  env: { 'jest/globals': true },
  rules,
});

export = {
  configs: {
    all: createConfig(allRules),
    recommended: createConfig(recommendedRules),
    style: createConfig({
      'jest/no-alias-methods': 'warn',
      'jest/prefer-to-be': 'error',
      'jest/prefer-to-contain': 'error',
      'jest/prefer-to-have-length': 'error',
    }),
  },
  environments: {
    globals: {
      globals,
    },
  },
  processors: {
    '.snap': snapshotProcessor,
  },
  rules,
};
