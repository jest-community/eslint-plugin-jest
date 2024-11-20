import type { TSESLint } from '@typescript-eslint/utils';

type SupportedConfigs = 'all' | 'recommended' | 'style';

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
  configs: Record<SupportedConfigs, TSESLint.ClassicConfig> &
		Record<`flat/${SupportedConfigs}`, TSESLint.FlatConfig>;
  rules: Record<string, TSESLint.RuleModule>;
};

export = plugin;
