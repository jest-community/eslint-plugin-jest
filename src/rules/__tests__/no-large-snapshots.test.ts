import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-large-snapshots';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

const generateSnapshotLines = (lines: number) =>
  `\`\n${'line\n'.repeat(lines)}\``;

const generateExportsSnapshotString = (
  lines: number,
  title: string = 'a big component 1',
) => `exports[\`${title}\`] = ${generateSnapshotLines(lines - 1)};`;

const generateExpectInlineSnapsCode = (
  lines: number,
  matcher: 'toMatchInlineSnapshot' | 'toThrowErrorMatchingInlineSnapshot',
) => `expect(something).${matcher}(${generateSnapshotLines(lines)});`;

ruleTester.run('no-large-snapshots', rule, {
  valid: [
    'expect(something)',
    'expect(something).toBe(1)',
    'expect(something).toMatchInlineSnapshot',
    {
      code: generateExpectInlineSnapsCode(2, 'toMatchInlineSnapshot'),
      filename: 'mock.js',
    },
    {
      code: generateExpectInlineSnapsCode(
        2,
        'toThrowErrorMatchingInlineSnapshot',
      ),
      filename: 'mock.js',
    },
    {
      code: generateExpectInlineSnapsCode(20, 'toMatchInlineSnapshot'),
      options: [
        {
          maxSize: 19,
          inlineMaxSize: 21,
        },
      ],
      filename: 'mock.jsx',
    },
    {
      code: generateExpectInlineSnapsCode(60, 'toMatchInlineSnapshot'),
      options: [
        {
          maxSize: 61,
        },
      ],
      filename: 'mock.jsx',
    },
    {
      // "should not report if node has fewer lines of code than limit"
      code: generateExportsSnapshotString(20),
      filename: '/mock-component.jsx.snap',
    },
    {
      // "it should not report snapshots that are allowed to be large"
      code: generateExportsSnapshotString(58),
      options: [
        {
          allowedSnapshots: {
            '/mock-component.jsx.snap': ['a big component 1'],
          },
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
    {
      code: generateExportsSnapshotString(20),
      options: [
        {
          maxSize: 21,
          inlineMaxSize: 19,
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
  ],
  invalid: [
    {
      code: generateExpectInlineSnapsCode(50, 'toMatchInlineSnapshot'),
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 51 },
        },
      ],
      filename: 'mock.js',
    },
    {
      code: generateExpectInlineSnapsCode(
        50,
        'toThrowErrorMatchingInlineSnapshot',
      ),
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 51 },
        },
      ],
      filename: 'mock.js',
    },
    {
      code: generateExpectInlineSnapsCode(
        50,
        'toThrowErrorMatchingInlineSnapshot',
      ),
      options: [{ maxSize: 51, inlineMaxSize: 50 }],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 51 },
        },
      ],
      filename: 'mock.js',
    },
    {
      // "it should return an empty object for non snapshot files"
      code: generateExpectInlineSnapsCode(50, 'toMatchInlineSnapshot'),
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 51 },
        },
      ],
      filename: 'mock.jsx',
    },
    {
      // "should report if node has more than 50 lines of code, and no sizeThreshold option is passed"
      code: generateExportsSnapshotString(52),
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 52 },
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
    {
      // "should report if node has more lines of code than number given in sizeThreshold option"
      code: generateExportsSnapshotString(100),
      options: [{ maxSize: 70 }],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 70, lineCount: 100 },
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
    {
      code: generateExportsSnapshotString(100),
      options: [{ maxSize: 70, inlineMaxSize: 101 }],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 70, lineCount: 100 },
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
    {
      // "should report if maxSize is zero"
      code: generateExportsSnapshotString(1),
      options: [{ maxSize: 0 }],
      errors: [
        {
          messageId: 'noSnapshot',
          data: { lineLimit: 0, lineCount: 1 },
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
    {
      // "it should report if file is not allowed"
      code: generateExportsSnapshotString(58),
      options: [
        {
          allowedSnapshots: {
            '/another-mock-component.jsx.snap': [/a big component \d+/u],
          },
        },
      ],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 58 },
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
    {
      // "should not report allowed large snapshots based on regexp"
      code: [
        generateExportsSnapshotString(58, 'a big component w/ text'),
        generateExportsSnapshotString(58, 'a big component 2'),
      ].join('\n\n'),
      options: [
        {
          allowedSnapshots: {
            '/mock-component.jsx.snap': [/a big component \d+/u],
          },
        },
      ],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 58 },
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
    {
      code: [
        generateExportsSnapshotString(58, 'a big component w/ text'),
        generateExportsSnapshotString(58, 'a big component 2'),
      ].join('\n\n'),
      options: [
        {
          allowedSnapshots: {
            '/mock-component.jsx.snap': ['a big component 2'],
          },
        },
      ],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 58 },
        },
      ],
      filename: '/mock-component.jsx.snap',
    },
  ],
});

describe('no-large-snapshots', () => {
  describe('when "allowedSnapshots" option contains relative paths', () => {
    it('should throw an exception', () => {
      expect(() => {
        const linter = new TSESLint.Linter();

        linter.defineRule('no-large-snapshots', rule);

        linter.verify(
          'console.log()',
          {
            rules: {
              'no-large-snapshots': [
                'error',
                {
                  allowedSnapshots: {
                    'mock-component.jsx.snap': [/a big component \d+/u],
                  },
                },
              ],
            },
          },
          'mock-component.jsx.snap',
        );
      }).toThrow(
        'All paths for allowedSnapshots must be absolute. You can use JS config and `path.resolve`',
      );
    });
  });
});
