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
    'it("many #different #tags", function () {})',
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

ruleTester.run(
  'require-hashtag-title with allowedHashtags=["unit", "smoke"]',
  rule,
  {
    valid: [
      {
        code: 'randomFunction()',
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      { code: 'foo.bar()', options: [{ allowedHashtags: ['unit', 'smoke'] }] },
      { code: 'it()', options: [{ allowedHashtags: ['unit', 'smoke'] }] },
      {
        code: 'it(42, function () {})',
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("#unit")',
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("#unit #smoke")',
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("#unit in the beginning", function () {})',
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("in the end #smoke", function () {})',
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("in the #unit middle", function () {})',
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("upper cased tag #Unit #SMOKE", function () {})',
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code:
          'it("should return the correct value #unit #happy-path", function () {})',
        options: [{ allowedHashtags: ['unit', 'happy-path', 'smoke'] }],
      },
    ],
    invalid: [
      {
        code: 'it("no tag at all", function () {})',
        errors: [
          {
            messageId: 'noTagFound',
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("", function () {})',
        errors: [
          {
            messageId: 'noTagFound',
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("# wrong tag", function () {})',
        errors: [
          {
            messageId: 'noTagFound',
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("wrong tag again #", function () {})',
        errors: [
          {
            messageId: 'noTagFound',
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("wrong # tag", function () {})',
        errors: [
          {
            messageId: 'noTagFound',
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("#", function () {})',
        errors: [
          {
            messageId: 'noTagFound',
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("#another tag", function () {})',
        errors: [
          {
            messageId: 'disallowedTag',
            data: { tag: 'another' },
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("another #different tag", function () {})',
        errors: [
          {
            messageId: 'disallowedTag',
            data: { tag: 'different' },
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },
      {
        code: 'it("another different #tag", function () {})',
        errors: [
          {
            messageId: 'disallowedTag',
            data: { tag: 'tag' },
          },
        ],
        options: [{ allowedHashtags: ['unit', 'smoke'] }],
      },

      {
        code: 'it("one #wrong and one #ok", function () {})',
        errors: [
          {
            messageId: 'disallowedTag',
            data: { tag: 'wrong' },
          },
        ],
        options: [{ allowedHashtags: ['ok'] }],
      },
    ],
  },
);
