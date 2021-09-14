import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, { JestVersion } from '../no-deprecated-functions';

const ruleTester = new TSESLint.RuleTester();

const generateValidCases = (
  jestVersion: JestVersion,
  functionCall: string,
): Array<TSESLint.ValidTestCase<never>> => {
  const [name, func] = functionCall.split('.');
  const settings = { jest: { version: jestVersion } } as const;
  const settingsString = { jest: { version: `${jestVersion}.0.0` } } as const;

  return [
    { settings, code: `${functionCall}()` },
    { settings, code: `${functionCall}` },
    { settings, code: `${name}['${func}']()` },
    { settings, code: `${name}['${func}']` },

    { settings: settingsString, code: `${functionCall}()` },
    { settings: settingsString, code: `${functionCall}` },
    { settings: settingsString, code: `${name}['${func}']()` },
    { settings: settingsString, code: `${name}['${func}']` },
  ];
};

const generateInvalidCases = (
  jestVersion: JestVersion,
  deprecation: string,
  replacement: string,
): Array<TSESLint.InvalidTestCase<'deprecatedFunction', never>> => {
  const [deprecatedName, deprecatedFunc] = deprecation.split('.');
  const [replacementName, replacementFunc] = replacement.split('.');
  const settings = { jest: { version: jestVersion } };
  const settingsString = { jest: { version: `${jestVersion}.0.0` } } as const;
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

    {
      code: `${deprecation}()`,
      output: `${replacement}()`,
      settings: settingsString,
      errors,
    },
    {
      code: `${deprecatedName}['${deprecatedFunc}']()`,
      output: `${replacementName}['${replacementFunc}']()`,
      settings: settingsString,
      errors,
    },
  ];
};

describe('the rule', () => {
  // a few sanity checks before doing our massive loop
  ruleTester.run('no-deprecated-functions', rule, {
    valid: [
      ...generateValidCases(20, 'jest'),
      ...generateValidCases(20, 'require("fs")'),

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
    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  ])('when using jest version %i', jestVersion => {
    const allowedFunctions: string[] = [];
    const deprecations = (
      [
        [15, 'jest.resetModuleRegistry', 'jest.resetModules'],
        [17, 'jest.addMatchers', 'expect.extend'],
        [21, 'require.requireMock', 'jest.requireMock'],
        [21, 'require.requireActual', 'jest.requireActual'],
        [22, 'jest.runTimersToTime', 'jest.advanceTimersByTime'],
        [26, 'jest.genMockFromModule', 'jest.createMockFromModule'],
      ] as const
    ).filter(deprecation => {
      if (deprecation[0] > jestVersion) {
        allowedFunctions.push(deprecation[1]);

        return false;
      }

      return true;
    });

    ruleTester.run(`with version ${jestVersion}`, rule, {
      valid: [
        ...generateValidCases(20, 'jest'),
        ...generateValidCases(20, 'require("fs")'),

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
  });

  test.each(['mumbo jumbo', [], {}])('invalid version, %j', version => {
    expect(() => {
      // @ts-expect-error: subset of `context`
      rule.create({ settings: { jest: { version } } });
    }).toThrow(
      'Jest version not provided through settings - see https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/no-deprecated-functions.md#jest-version',
    );
  });
});
