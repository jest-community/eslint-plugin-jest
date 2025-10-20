import type { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';

interface ContextSettings {
  [key: string]: unknown;
  jest?: EslintPluginJestSettings;
}

interface EslintPluginJestSettings {
  version: JestVersion | string;
}

export interface EslintPluginJestRuleContext
  extends Readonly<RuleContext<never, []>> {
  settings: ContextSettings;
}

export type JestVersion =
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | number;

let cachedJestVersion: JestVersion | null = null;

const parseJestVersion = (rawVersion: number | string): JestVersion => {
  if (typeof rawVersion === 'number') {
    return rawVersion;
  }

  const [majorVersion] = rawVersion.split('.');

  return parseInt(majorVersion, 10);
};

export const getContextJestVersion = (
  context: EslintPluginJestRuleContext,
): JestVersion | null => {
  return context.settings.jest?.version
    ? parseJestVersion(context.settings.jest.version)
    : null;
};

export const detectJestVersion = (): JestVersion | null => {
  if (cachedJestVersion) {
    return cachedJestVersion;
  }

  try {
    const jestPath = require.resolve('jest/package.json');

    const jestPackageJson =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(jestPath) as JSONSchemaForNPMPackageJsonFiles;

    if (jestPackageJson.version) {
      return (cachedJestVersion = parseJestVersion(jestPackageJson.version));
    }
  } catch {}

  return null;
};

export const getJestVersion = (
  context: EslintPluginJestRuleContext,
): JestVersion | null => {
  return getContextJestVersion(context) || detectJestVersion();
};
