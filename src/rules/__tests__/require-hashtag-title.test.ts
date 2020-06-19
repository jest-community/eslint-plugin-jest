import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../require-hashtag-title';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('require-hashtag-title', rule, {
  valid: [
    'randomFunction()',
    'foo.bar()',
    'it()',
    'it(42, function () {})',
    'it("#test")',
    'it("#test", function () {})',
    'it("#test in the beginning", function () {})',
    'it("in the end #test", function () {})',
    'it("in the #test middle", function () {})',
  ],
  invalid: [
    {
      code: 'it("no tag at all", function () {})',
      errors: [
        {
          messageId: 'noTagFound',
        },
      ],
    },
    {
      code: 'it("", function () {})',
      errors: [
        {
          messageId: 'noTagFound',
        },
      ],
    },
    {
      code: 'it("# wrong tag", function () {})',
      errors: [
        {
          messageId: 'noTagFound',
        },
      ],
    },
    {
      code: 'it("wrong tag again #", function () {})',
      errors: [
        {
          messageId: 'noTagFound',
        },
      ],
    },
    {
      code: 'it("wrong # tag", function () {})',
      errors: [
        {
          messageId: 'noTagFound',
        },
      ],
    },
    {
      code: 'it("#", function () {})',
      errors: [
        {
          messageId: 'noTagFound',
        },
      ],
    },
  ],
});
