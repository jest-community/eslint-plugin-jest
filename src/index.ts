import { readdirSync } from 'fs';
import { join, parse } from 'path';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import globals from './globals.json';
import * as snapshotProcessor from './processors/snapshot-processor';

type RuleModule = TSESLint.RuleModule<string, unknown[]> & {
  meta: Required<Pick<TSESLint.RuleMetaData<string>, 'docs'>>;
};

// can be removed once we've on v5 of `@typescript-eslint/experimental-utils`
declare module '@typescript-eslint/experimental-utils/dist/ts-eslint/Rule' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface RuleMetaData<TMessageIds extends string> {
    hasSuggestions?: boolean;
  }
}

// copied from https://github.com/babel/babel/blob/d8da63c929f2d28c401571e2a43166678c555bc4/packages/babel-helpers/src/helpers.js#L602-L606
/* istanbul ignore next */
const interopRequireDefault = (obj: any): { default: any } =>
  obj && obj.__esModule ? obj : { default: obj };

const importDefault = (moduleName: string) =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  interopRequireDefault(require(moduleName)).default;

const rulesDir = join(__dirname, 'rules');
const excludedFiles = ['__tests__', 'detectJestVersion', 'utils'];

const rules = readdirSync(rulesDir)
  .map(rule => parse(rule).name)
  .filter(rule => !excludedFiles.includes(rule))
  .reduce<Record<string, RuleModule>>(
    (acc, curr) => ({
      ...acc,
      [curr]: importDefault(join(rulesDir, curr)) as RuleModule,
    }),
    {},
  );

const recommendedRules = Object.entries(rules)
  .filter(([, rule]) => rule.meta.docs.recommended)
  .reduce(
    (acc, [name, rule]) => ({
      ...acc,
      [`jest/${name}`]: rule.meta.docs.recommended,
    }),
    {},
  );

const allRules = Object.entries(rules)
  .filter(([, rule]) => !rule.meta.deprecated)
  .reduce(
    (acc, [name]) => ({
      ...acc,
      [`jest/${name}`]: 'error',
    }),
    {},
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
    style: {
      plugins: ['jest'],
      rules: {
        'jest/no-alias-methods': 'warn',
        'jest/prefer-to-be-null': 'error',
        'jest/prefer-to-be-undefined': 'error',
        'jest/prefer-to-contain': 'error',
        'jest/prefer-to-have-length': 'error',
      },
    },
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
