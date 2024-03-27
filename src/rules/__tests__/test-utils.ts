import { createRequire } from 'module';
import { TSESLint } from '@typescript-eslint/utils';
import { version as eslintVersion } from 'eslint/package.json';
import * as semver from 'semver';

const require = createRequire(__filename);
const eslintRequire = createRequire(require.resolve('eslint'));

export const espreeParser = eslintRequire.resolve('espree');

export const usingFlatConfig = () => semver.major(eslintVersion) >= 9;

export class FlatCompatRuleTester extends TSESLint.RuleTester {
  public constructor(testerConfig?: TSESLint.RuleTesterConfig) {
    super(FlatCompatRuleTester._flatCompat(testerConfig));
  }

  public override run<
    TMessageIds extends string,
    TOptions extends Readonly<unknown[]>,
  >(
    ruleName: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: TSESLint.RunTests<TMessageIds, TOptions>,
  ) {
    super.run(ruleName, rule, {
      valid: tests.valid.map(t => FlatCompatRuleTester._flatCompat(t)),
      invalid: tests.invalid.map(t => FlatCompatRuleTester._flatCompat(t)),
    });
  }

  /* istanbul ignore next */
  private static _flatCompat<
    T extends
      | undefined
      | TSESLint.RuleTesterConfig
      | string
      | TSESLint.ValidTestCase<unknown[]>
      | TSESLint.InvalidTestCase<string, unknown[]>,
  >(config: T): T {
    if (!config || !usingFlatConfig() || typeof config === 'string') {
      return config;
    }

    const obj = { languageOptions: { parserOptions: {} } };

    for (const [key, value] of Object.entries(config)) {
      if (key === 'parser') {
        // @ts-expect-error this is expected
        obj.languageOptions.parser = require(value);

        continue;
      }

      if (key === 'parserOptions') {
        for (const parserOption of Object.entries(value)) {
          if (
            parserOption[0] === 'ecmaVersion' ||
            parserOption[0] === 'sourceType'
          ) {
            // @ts-expect-error this is expected
            obj.languageOptions[parserOption[0]] = parserOption[1];

            continue;
          }

          // @ts-expect-error this is expected
          obj.languageOptions.parserOptions[parserOption[0]] = parserOption[1];
        }

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
  }
}
