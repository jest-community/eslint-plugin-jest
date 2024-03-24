import { createRequire } from 'module';
import { TSESLint } from '@typescript-eslint/utils';
import { version as eslintVersion } from 'eslint/package.json';
import * as semver from 'semver';

const require = createRequire(__filename);
const eslintRequire = createRequire(require.resolve('eslint'));

export const espreeParser = eslintRequire.resolve('espree');

export class FlatCompatRuleTester extends TSESLint.RuleTester {
  public constructor(testerConfig?: TSESLint.RuleTesterConfig) {
    super(flatCompat(testerConfig));
  }

  public override run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(ruleName: string, rule: TSESLint.RuleModule<TMessageIds, TOptions>, tests: TSESLint.RunTests<TMessageIds, TOptions>) {
    super.run(ruleName, rule, {
      valid: tests.valid.map(t => flatCompat(t)),
      invalid: tests.invalid.map(t => flatCompat(t)),
    });
  }
}

export const flatCompat = <
  T extends
    | undefined
    | TSESLint.RuleTesterConfig
    | string
    | TSESLint.ValidTestCase<unknown[]>
    | TSESLint.InvalidTestCase<string, unknown[]>,
>(
  config: T,
): T => {
  if (!config || semver.major(eslintVersion) < 9 || typeof config === 'string') {
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
