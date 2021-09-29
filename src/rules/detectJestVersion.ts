import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';

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
  | number;

let cachedJestVersion: JestVersion | null = null;

export const detectJestVersion = (): JestVersion => {
  if (cachedJestVersion) {
    return cachedJestVersion;
  }

  try {
    const jestPath = require.resolve('jest/package.json');

    const jestPackageJson =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(jestPath) as JSONSchemaForNPMPackageJsonFiles;

    if (jestPackageJson.version) {
      const [majorVersion] = jestPackageJson.version.split('.');

      return (cachedJestVersion = parseInt(majorVersion, 10));
    }
  } catch {}

  throw new Error(
    'Unable to detect Jest version - please ensure jest package is installed, or otherwise set version explicitly',
  );
};
