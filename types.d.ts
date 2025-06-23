declare module 'eslint-plugin-eslint-plugin' {
  import type * as ESLint from 'eslint';

  const plugin: ESLint.ESLint.Plugin & {
    configs: {
      all: ESLint.Linter.LegacyConfig;
      'all-type-checked': ESLint.Linter.LegacyConfig;
      recommended: ESLint.Linter.LegacyConfig;
      rules: ESLint.Linter.LegacyConfig;
      tests: ESLint.Linter.LegacyConfig;
      'rules-recommended': ESLint.Linter.LegacyConfig;
      'tests-recommended': ESLint.Linter.LegacyConfig;

      'flat/all': ESLint.Linter.FlatConfig;
      'flat/all-type-checked': ESLint.Linter.FlatConfig;
      'flat/recommended': ESLint.Linter.FlatConfig;
      'flat/rules': ESLint.Linter.FlatConfig;
      'flat/tests': ESLint.Linter.FlatConfig;
      'flat/rules-recommended': ESLint.Linter.FlatConfig;
      'flat/tests-recommended': ESLint.Linter.FlatConfig;
    };
  };
  export = plugin;
}

// todo: see https://github.com/eslint-community/eslint-plugin-eslint-comments/pull/246
declare module '@eslint-community/eslint-plugin-eslint-comments/configs' {
  import type * as ESLint from 'eslint';

  const configs: {
    recommended: ESLint.Linter.FlatConfig & {
      plugins: {
        '@eslint-community/eslint-plugin-eslint-comments': ESLint.ESLint.Plugin;
      };
    };
  };
  export = configs;
}
