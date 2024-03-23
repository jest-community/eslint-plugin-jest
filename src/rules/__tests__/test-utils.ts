import { createRequire } from 'module';
import type { TSESLint } from '@typescript-eslint/utils';
import { version as eslintVersion } from 'eslint/package.json';
import * as semver from 'semver';

const require = createRequire(__filename);
const eslintRequire = createRequire(require.resolve('eslint'));

export const espreeParser = eslintRequire.resolve('espree');

export const flatCompat = <
  T extends
    | TSESLint.RuleTesterConfig
    | TSESLint.ValidTestCase<unknown[]>
    | TSESLint.InvalidTestCase<string, unknown[]>,
>(
  config: T,
): T => {
  if (semver.major(eslintVersion) < 9) {
    return config;
  }

  const obj = { languageOptions: {} };

  for (const [key, value] of Object.entries(config)) {
    if (key === 'parser') {
      // @ts-expect-error this is expected
      obj.languageOptions.parser = require(value);

      continue;
    }

    if (key === 'parserOptions') {
      obj.languageOptions = {
        ...obj.languageOptions,
        ...value,
      };

      continue;
    }

    // @ts-expect-error this is expected
    obj[key] = value;
  }

  return obj as unknown as T;

  // return {
  //   languageOptions: {
  //     parser: require(config.parser),
  //     ...config.parserOptions,
  //   },
  // } as unknown as T;
};
