import { createRequire } from 'module';
import { TSESLint } from '@typescript-eslint/utils';
import { version as eslintVersion } from 'eslint/package.json';
import * as semver from 'semver';

const require = createRequire(__filename);
const eslintRequire = createRequire(require.resolve('eslint'));

export const espreeParser = eslintRequire.resolve('espree');

export const eslintMajorVersion = semver.major(eslintVersion);
export const usingFlatConfig = eslintMajorVersion >= 9;

export class FlatCompatRuleTester extends TSESLint.RuleTester {
  public constructor(testerConfig?: TSESLint.RuleTesterConfig) {
    super(FlatCompatRuleTester._flatCompat(testerConfig));
  }

  public override run<
    TMessageIds extends string,
    TOptions extends readonly unknown[],
  >(
    ruleName: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: TSESLint.RunTests<TMessageIds, TOptions>,
  ) {
    super.run(ruleName, rule, {
      valid: FlatCompatRuleTester._filterCases(
        tests.valid.map(t => FlatCompatRuleTester._flatCompat(t)),
      ),
      invalid: FlatCompatRuleTester._filterCases(
        tests.invalid.map(t => FlatCompatRuleTester._flatCompat(t)),
      ),
    });
  }

  /* istanbul ignore next */
  /**
   * Filters out test cases that are using ecma version 2022 or higher when running
   * on ESLint v7
   * @private
   */
  private static _filterCases<
    T extends
      | string
      | TSESLint.ValidTestCase<unknown[]>
      | TSESLint.InvalidTestCase<string, unknown[]>,
  >(tests: T[]): T[] {
    if (semver.major(eslintVersion) > 7) {
      return tests;
    }

    const filtered = tests.filter(
      t =>
        typeof t === 'string' ||
        !t.parserOptions?.ecmaVersion ||
        t.parserOptions.ecmaVersion === 'latest' ||
        t.parserOptions.ecmaVersion < 2022,
    );

    // print the number of tests that were filtered
    if (filtered.length !== tests.length) {
      console.warn(
        `Filtered ${tests.length - filtered.length} tests due to unsupported parser options.`,
      );
    }

    return filtered;
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
    if (!config || !usingFlatConfig || typeof config === 'string') {
      return config;
    }

    const obj: TSESLint.FlatConfig.Config & {
      languageOptions: TSESLint.FlatConfig.LanguageOptions & {
        parserOptions: TSESLint.FlatConfig.ParserOptions;
      };
    } = {
      languageOptions: { parserOptions: {} },
    };

    for (const [key, value] of Object.entries(config)) {
      if (key === 'parser') {
        obj.languageOptions.parser = require(value);

        continue;
      }

      if (key === 'parserOptions') {
        for (const [option, val] of Object.entries(value)) {
          if (option === 'ecmaVersion' || option === 'sourceType') {
            // @ts-expect-error: TS thinks the value could the opposite type of whatever option is
            obj.languageOptions[option] =
              val as TSESLint.FlatConfig.LanguageOptions[
                | 'ecmaVersion'
                | 'sourceType'];

            continue;
          }

          obj.languageOptions.parserOptions[option] = val;
        }

        continue;
      }

      obj[key as keyof typeof obj] = value;
    }

    return obj as unknown as T;
  }
}
