import type { TSESLint } from '@typescript-eslint/utils';

type JestPluginConfigName = 'all' | 'recommended' | 'style';

declare const plugin: {
  meta: {
    name: string;
    version: string;
  };
  environments: {
    globals: {
      globals: Record<string, boolean>;
    };
  };
  configs: Record<JestPluginConfigName, TSESLint.ClassicConfig> &
    Record<`flat/${JestPluginConfigName}`, TSESLint.FlatConfig>;
  rules: Record<string, TSESLint.RuleModule>;
};

export = plugin;
