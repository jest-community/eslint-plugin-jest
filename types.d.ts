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
