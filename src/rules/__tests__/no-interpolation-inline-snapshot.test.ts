import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-interpolation-inline-snapshot';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('no-interpolation-inline-snapshot', rule, {
  valid: [
    'expect(something).toMatchInlineSnapshot();',
    'expect(something).toMatchInlineSnapshot(`No interpolation`);',
    'expect(something).toMatchInlineSnapshot({}, `No interpolation`);',
    'expect(something);',
    'expect(something).not;',
    'expect.toHaveAssertions();',
    'myObjectWants.toMatchInlineSnapshot({}, `${interpolated}`);',
    'toMatchInlineSnapshot({}, `${interpolated}`);',
  ],
  invalid: [
    {
      code: 'expect(something).toMatchInlineSnapshot(`${interpolated}`);',
      errors: [
        {
          endColumn: 58,
          column: 41,
          messageId: 'noInterpolation',
        },
      ],
    },
    {
      code: 'expect(something).not.toMatchInlineSnapshot(`${interpolated}`);',
      errors: [
        {
          endColumn: 62,
          column: 45,
          messageId: 'noInterpolation',
        },
      ],
    },
    {
      code: 'expect(something).toMatchInlineSnapshot({}, `${interpolated}`);',
      errors: [
        {
          endColumn: 62,
          column: 45,
          messageId: 'noInterpolation',
        },
      ],
    },
    {
      code:
        'expect(something).not.toMatchInlineSnapshot({}, `${interpolated}`);',
      errors: [
        {
          endColumn: 66,
          column: 49,
          messageId: 'noInterpolation',
        },
      ],
    },
  ],
});
