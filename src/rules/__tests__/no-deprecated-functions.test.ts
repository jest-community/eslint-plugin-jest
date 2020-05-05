import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, {
  JestVersion,
  _clearCachedJestVersion,
} from '../no-deprecated-functions';

const ruleTester = new TSESLint.RuleTester();

/**
 * Makes a new temp directory, prefixed with `eslint-plugin-jest-`
 *
 * @return {Promise<string>}
 */
const makeTempDir = async () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-plugin-jest-'));

/**
 * Sets up a fake project with a `package.json` file located in
 * `node_modules/jest` whose version is set to the given `jestVersion`.
 *
 * @param {JestVersion} jestVersion
 *
 * @return {Promise<string>}
 */
const setupFakeProjectDirectory = async (
  jestVersion: JestVersion,
): Promise<string> => {
  const jestPackageJson: JSONSchemaForNPMPackageJsonFiles = {
    name: 'jest',
    version: `${jestVersion}.0.0`,
  };

  const tempDir = await makeTempDir();
  const jestPackagePath = path.join(tempDir, 'node_modules', 'jest');

  // todo: remove in node@10 & replace with { recursive: true }
  fs.mkdirSync(path.join(tempDir, 'node_modules'));

  fs.mkdirSync(jestPackagePath);
  await fs.writeFileSync(
    path.join(jestPackagePath, 'package.json'),
    JSON.stringify(jestPackageJson),
  );

  return tempDir;
};

const generateValidCases = (
  jestVersion: JestVersion | undefined,
  functionCall: string,
): Array<TSESLint.ValidTestCase<never>> => {
  const [name, func] = functionCall.split('.');
  const settings = { jest: { version: jestVersion } } as const;

  return [
    { settings, code: `${functionCall}()` },
    { settings, code: `${functionCall}` },
    { settings, code: `${name}['${func}']()` },
    { settings, code: `${name}['${func}']` },
  ];
};

const generateInvalidCases = (
  jestVersion: JestVersion | undefined,
  deprecation: string,
  replacement: string,
): Array<TSESLint.InvalidTestCase<'deprecatedFunction', never>> => {
  const [deprecatedName, deprecatedFunc] = deprecation.split('.');
  const [replacementName, replacementFunc] = replacement.split('.');
  const settings = { jest: { version: jestVersion } };
  const errors: [TSESLint.TestCaseError<'deprecatedFunction'>] = [
    { messageId: 'deprecatedFunction', data: { deprecation, replacement } },
  ];

  return [
    {
      code: `${deprecation}()`,
      output: `${replacement}()`,
      settings,
      errors,
    },
    {
      code: `${deprecatedName}['${deprecatedFunc}']()`,
      output: `${replacementName}['${replacementFunc}']()`,
      settings,
      errors,
    },
  ];
};

describe('the jest version cache', () => {
  beforeEach(async () => process.chdir(await setupFakeProjectDirectory(17)));

  // change the jest version *after* each test case
  afterEach(async () => {
    const jestPackageJson: JSONSchemaForNPMPackageJsonFiles = {
      name: 'jest',
      version: '24.0.0',
    };

    const tempDir = process.cwd();

    await fs.writeFileSync(
      path.join(tempDir, 'node_modules', 'jest', 'package.json'),
      JSON.stringify(jestPackageJson),
    );
  });

  ruleTester.run('no-deprecated-functions', rule, {
    valid: [
      'require("fs")', // this will cause jest version to be read & cached
      'jest.requireActual()', // deprecated after jest 17
    ],
    invalid: [],
  });
});

// contains the cache-clearing beforeEach so we can test the cache too
describe('the rule', () => {
  beforeEach(() => _clearCachedJestVersion());

  // a few sanity checks before doing our massive loop
  ruleTester.run('no-deprecated-functions', rule, {
    valid: [
      'jest',
      'require("fs")',
      ...generateValidCases(14, 'jest.resetModuleRegistry'),
      ...generateValidCases(17, 'require.requireActual'),
      ...generateValidCases(25, 'jest.genMockFromModule'),
    ],
    invalid: [
      ...generateInvalidCases(
        21,
        'jest.resetModuleRegistry',
        'jest.resetModules',
      ),
      ...generateInvalidCases(24, 'jest.addMatchers', 'expect.extend'),
      ...generateInvalidCases(
        26,
        'jest.genMockFromModule',
        'jest.createMockFromModule',
      ),
    ],
  });

  describe.each<JestVersion>([
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
  ])('when using jest version %i', jestVersion => {
    beforeEach(async () =>
      process.chdir(await setupFakeProjectDirectory(jestVersion)),
    );

    const allowedFunctions: string[] = [];
    const deprecations = ([
      [15, 'jest.resetModuleRegistry', 'jest.resetModules'],
      [17, 'jest.addMatchers', 'expect.extend'],
      [21, 'require.requireMock', 'jest.requireMock'],
      [21, 'require.requireActual', 'jest.requireActual'],
      [22, 'jest.runTimersToTime', 'jest.advanceTimersByTime'],
      [26, 'jest.genMockFromModule', 'jest.createMockFromModule'],
    ] as const).filter(deprecation => {
      if (deprecation[0] > jestVersion) {
        allowedFunctions.push(deprecation[1]);

        return false;
      }

      return true;
    });

    ruleTester.run('explict jest version', rule, {
      valid: [
        'jest',
        'require("fs")',
        ...allowedFunctions
          .map(func => generateValidCases(jestVersion, func))
          .reduce((acc, arr) => acc.concat(arr), []),
      ],
      invalid: deprecations
        .map(([, deprecation, replacement]) =>
          generateInvalidCases(jestVersion, deprecation, replacement),
        )
        .reduce((acc, arr) => acc.concat(arr), []),
    });

    ruleTester.run('detected jest version', rule, {
      valid: [
        'jest',
        'require("fs")',
        ...allowedFunctions
          .map(func => generateValidCases(undefined, func))
          .reduce((acc, arr) => acc.concat(arr), []),
      ],
      invalid: deprecations
        .map(([, deprecation, replacement]) =>
          generateInvalidCases(undefined, deprecation, replacement),
        )
        .reduce((acc, arr) => acc.concat(arr), []),
    });
  });

  describe('when no jest version is provided', () => {
    describe('when the jest package.json is missing the version property', () => {
      beforeEach(async () => {
        const tempDir = await setupFakeProjectDirectory(1);

        await fs.writeFileSync(
          path.join(tempDir, 'node_modules', 'jest', 'package.json'),
          JSON.stringify({}),
        );

        process.chdir(tempDir);
      });

      it('requires the version to be set explicitly', () => {
        expect(() => {
          const linter = new TSESLint.Linter();

          linter.defineRule('no-deprecated-functions', rule);

          linter.verify('jest.resetModuleRegistry()', {
            rules: { 'no-deprecated-functions': 'error' },
          });
        }).toThrow(
          'Unable to detect Jest version - please ensure jest package is installed, or otherwise set version explicitly',
        );
      });
    });

    describe('when the jest package.json is not found', () => {
      beforeEach(async () => process.chdir(await makeTempDir()));

      it('requires the version to be set explicitly', () => {
        expect(() => {
          const linter = new TSESLint.Linter();

          linter.defineRule('no-deprecated-functions', rule);

          linter.verify('jest.resetModuleRegistry()', {
            rules: { 'no-deprecated-functions': 'error' },
          });
        }).toThrow(
          'Unable to detect Jest version - please ensure jest package is installed, or otherwise set version explicitly',
        );
      });
    });
  });
});
