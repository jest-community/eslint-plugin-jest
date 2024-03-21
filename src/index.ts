import { readdirSync } from 'fs';
import { join, parse } from 'path';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  name as packageName,
  version as packageVersion,
} from '../package.json';
import globals from './globals.json';
import * as snapshotProcessor from './processors/snapshot-processor';

type RuleModule = TSESLint.RuleModule<string, unknown[]> & {
  meta: Required<Pick<TSESLint.RuleMetaData<string>, 'docs'>>;
};

// v5 of `@typescript-eslint/experimental-utils` removed this
declare module '@typescript-eslint/utils/dist/ts-eslint/Rule' {
  export interface RuleMetaDataDocs {
    category: 'Best Practices' | 'Possible Errors';
  }
}

declare module '@typescript-eslint/utils/dist/ts-eslint/SourceCode' {
  export interface SourceCode {
    /**
     * Returns the scope of the given node.
     * This information can be used track references to variables.
     * @since 8.37.0
     */
    getScope(node: TSESTree.Node): TSESLint.Scope.Scope;
    /**
     * Returns an array of the ancestors of the given node, starting at
     * the root of the AST and continuing through the direct parent of the current node.
     * This array does not include the currently-traversed node itself.
     * @since 8.38.0
     */
    getAncestors(node: TSESTree.Node): TSESTree.Node[];
    /**
     * Returns a list of variables declared by the given node.
     * This information can be used to track references to variables.
     * @since 8.38.0
     */
    getDeclaredVariables(
      node: TSESTree.Node,
    ): readonly TSESLint.Scope.Variable[];
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

const rules = Object.fromEntries(
  readdirSync(rulesDir)
    .map(rule => parse(rule).name)
    .filter(rule => !excludedFiles.includes(rule))
    .map(rule => [rule, importDefault(join(rulesDir, rule)) as RuleModule]),
);

const recommendedRules = {
  'jest/expect-expect': 'warn',
  'jest/no-alias-methods': 'error',
  'jest/no-commented-out-tests': 'warn',
  'jest/no-conditional-expect': 'error',
  'jest/no-deprecated-functions': 'error',
  'jest/no-disabled-tests': 'warn',
  'jest/no-done-callback': 'error',
  'jest/no-export': 'error',
  'jest/no-focused-tests': 'error',
  'jest/no-identical-title': 'error',
  'jest/no-interpolation-in-snapshots': 'error',
  'jest/no-jasmine-globals': 'error',
  'jest/no-mocks-import': 'error',
  'jest/no-standalone-expect': 'error',
  'jest/no-test-prefixes': 'error',
  'jest/valid-describe-callback': 'error',
  'jest/valid-expect': 'error',
  'jest/valid-expect-in-promise': 'error',
  'jest/valid-title': 'error',
} satisfies Record<string, TSESLint.Linter.RuleLevel>;

const styleRules = {
  'jest/no-alias-methods': 'warn',
  'jest/prefer-to-be': 'error',
  'jest/prefer-to-contain': 'error',
  'jest/prefer-to-have-length': 'error',
} satisfies Record<string, TSESLint.Linter.RuleLevel>;

const allRules = Object.fromEntries<TSESLint.Linter.RuleLevel>(
  Object.entries(rules)
    .filter(([, rule]) => !rule.meta.deprecated)
    .map(([name]) => [`jest/${name}`, 'error']),
);

const plugin = {
  meta: { name: packageName, version: packageVersion },
  // ugly cast for now to keep TypeScript happy since
  // we don't have types for flat config yet
  configs: {} as Record<
    | 'all'
    | 'recommended'
    | 'style'
    | 'flat/all'
    | 'flat/recommended'
    | 'flat/style'
    | 'flat/snapshots',
    Pick<Required<TSESLint.Linter.Config>, 'rules'>
  >,
  environments: {
    globals: {
      globals,
    },
  },
  processors: {
    snapshots: snapshotProcessor,
    '.snap': snapshotProcessor,
  },
  rules,
};

const createRCConfig = (rules: Record<string, TSESLint.Linter.RuleLevel>) => ({
  plugins: ['jest'],
  env: { 'jest/globals': true },
  rules,
});

const createFlatConfig = (
  rules: Record<string, TSESLint.Linter.RuleLevel>,
) => ({
  plugins: { jest: plugin },
  languageOptions: { globals },
  rules,
});

plugin.configs = {
  all: createRCConfig(allRules),
  recommended: createRCConfig(recommendedRules),
  style: createRCConfig(styleRules),
  'flat/all': createFlatConfig(allRules),
  'flat/recommended': createFlatConfig(recommendedRules),
  'flat/style': createFlatConfig(styleRules),
  'flat/snapshots': {
    // @ts-expect-error this is introduced in flat config
    files: ['**/*.snap'],
    plugins: { jest: plugin },
    processor: 'jest/snapshots',
  },
};

export = plugin;
