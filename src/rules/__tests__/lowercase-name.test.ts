import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../lowercase-name';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('lowercase-name with allowedPrefixes', rule, {
  valid: [
    {
      code: "it('GET /live', function () {})",
      options: [{ allowedPrefixes: ['GET'] }],
    },
    {
      code: 'it("POST /live", function () {})',
      options: [{ allowedPrefixes: ['GET', 'POST'] }],
    },
    {
      code: 'it(`PATCH /live`, function () {})',
      options: [{ allowedPrefixes: ['GET', 'PATCH'] }],
    },
  ],
  invalid: [],
});
