import { readdirSync } from 'fs';
import { basename, join } from 'path';
import globals from './globals.json';
import * as snapshotProcessor from './processors/snapshot-processor';

// copied from https://github.com/babel/babel/blob/d8da63c929f2d28c401571e2a43166678c555bc4/packages/babel-helpers/src/helpers.js#L602-L606
/* istanbul ignore next */
const interopRequireDefault = (obj: any): { default: any } =>
  obj && obj.__esModule ? obj : { default: obj };

const importDefault = (moduleName: string) =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  interopRequireDefault(require(moduleName)).default;

const rulesDir = join(__dirname, 'rules');

const rules = readdirSync(rulesDir)
  .filter(
    rule =>
      rule !== '__tests__' &&
      rule !== 'util.js' &&
      rule !== 'tsUtils.ts' &&
      rule !== 'tsUtils.js',
  )
  .map(rule =>
    rule.endsWith('js') ? basename(rule, '.js') : basename(rule, '.ts'),
  )
  .reduce(
    (acc, curr) =>
      Object.assign(acc, { [curr]: importDefault(join(rulesDir, curr)) }),
    {},
  );
const allRules: Record<string, string> = {};
Object.keys(rules).forEach(key => (allRules[`jest/${key}`] = 'error'));

export default {
  configs: {
    all: {
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
      rules: allRules,
    },
    recommended: {
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
      rules: {
        'jest/no-alias-methods': 'warn',
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/no-jest-import': 'error',
        // 'jest/no-mocks-import': 'error',
        'jest/no-jasmine-globals': 'warn',
        'jest/no-test-prefixes': 'error',
        'jest/valid-describe': 'error',
        'jest/valid-expect': 'error',
        'jest/valid-expect-in-promise': 'error',
      },
    },
    style: {
      plugins: ['jest'],
      rules: {
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
