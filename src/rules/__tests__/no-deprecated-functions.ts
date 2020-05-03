import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-deprecated-functions';

const ruleTester = new TSESLint.RuleTester();

[
  ['require.requireMock', 'jest.requireMock'],
  ['require.requireActual', 'jest.requireActual'],
  ['jest.addMatchers', 'expect.extend'],
  ['jest.resetModuleRegistry', 'jest.resetModules'],
  ['jest.runTimersToTime', 'jest.advanceTimersByTime'],
].forEach(([deprecation, replacement]) => {
  const [deprecatedName, deprecatedFunc] = deprecation.split('.');
  const [replacementName, replacementFunc] = replacement.split('.');

  ruleTester.run(`${deprecation} -> ${replacement}`, rule, {
    valid: [
      'jest',
      'require("fs")',
      `${replacement}()`,
      replacement,
      `${replacementName}['${replacementFunc}']()`,
      `${replacementName}['${replacementFunc}']`,
    ],
    invalid: [
      {
        code: `${deprecation}()`,
        output: `${replacement}()`,
        errors: [
          {
            messageId: 'deprecatedFunction',
            data: { deprecation, replacement },
          },
        ],
      },
      {
        code: `${deprecatedName}['${deprecatedFunc}']()`,
        output: `${replacementName}['${replacementFunc}']()`,
        errors: [
          {
            messageId: 'deprecatedFunction',
            data: { deprecation, replacement },
          },
        ],
      },
    ],
  });
});
