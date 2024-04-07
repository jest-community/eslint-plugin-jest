import { TSESLint } from '@typescript-eslint/utils';
import rule from '../no-deprecated-functions';
import {
  type JestVersion,
  detectJestVersion,
} from '../utils/detectJestVersion';
import {
  FlatCompatRuleTester as RuleTester,
  usingFlatConfig,
} from './test-utils';

jest.mock('../utils/detectJestVersion');

const detectJestVersionMock = detectJestVersion as jest.MockedFunction<
  typeof detectJestVersion
>;

const ruleTester = new RuleTester();

const generateValidCases = (
  jestVersion: JestVersion | string | undefined,
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
  jestVersion: JestVersion | string | undefined,
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

// contains the cache-clearing beforeEach so we can test the cache too
describe('the rule', () => {
  // a few sanity checks before doing our massive loop
  ruleTester.run('no-deprecated-functions', rule, {
    valid: [
      { code: 'jest', settings: { jest: { version: 14 } } },
      { code: 'require("fs")', settings: { jest: { version: 14 } } },
      ...generateValidCases(14, 'jest.resetModuleRegistry'),
      ...generateValidCases(17, 'require.requireActual'),
      ...generateValidCases(25, 'jest.genMockFromModule'),
      ...generateValidCases('25.1.1', 'jest.genMockFromModule'),
      ...generateValidCases('17.2', 'require.requireActual'),
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
      ...generateInvalidCases(
        '26.0.0-next.11',
        'jest.genMockFromModule',
        'jest.createMockFromModule',
      ),
    ],
  });

  describe.each<JestVersion>([
    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  ])('when using jest version %i', jestVersion => {
    beforeEach(async () => {
      detectJestVersionMock.mockReturnValue(jestVersion);
    });

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

    ruleTester.run('explict jest version', rule, {
      valid: [
        'jest',
        'require("fs")',
        ...allowedFunctions.flatMap(func =>
          generateValidCases(jestVersion, func),
        ),
      ],
      invalid: deprecations.flatMap(([, deprecation, replacement]) =>
        generateInvalidCases(jestVersion, deprecation, replacement),
      ),
    });

    ruleTester.run('detected jest version', rule, {
      valid: [
        'jest',
        'require("fs")',
        ...allowedFunctions.flatMap(func =>
          generateValidCases(undefined, func),
        ),
      ],
      invalid: deprecations.flatMap(([, deprecation, replacement]) =>
        generateInvalidCases(undefined, deprecation, replacement),
      ),
    });
  });

  describe('when there is an error in detecting the jest version', () => {
    beforeEach(() => {
      detectJestVersionMock.mockImplementation(() => {
        throw new Error('oh noes!');
      });
    });

    it('bubbles the error up', () => {
      expect(() => {
        const linter = new TSESLint.Linter();

        /* istanbul ignore if */
        if (usingFlatConfig) {
          linter.verify('jest.resetModuleRegistry()', [
            {
              plugins: {
                jest: { rules: { 'no-deprecated-functions': rule } },
              },
              rules: { 'jest/no-deprecated-functions': 'error' },
            },
          ]);

          return;
        }

        linter.defineRule('no-deprecated-functions', rule);

        linter.verify('jest.resetModuleRegistry()', {
          rules: { 'no-deprecated-functions': 'error' },
        });
      }).toThrow('oh noes!');
    });
  });
});
