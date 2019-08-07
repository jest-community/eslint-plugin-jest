import { RuleTester } from 'eslint';
import rule from '../no-large-snapshots';

const noLargeSnapshots = rule.create;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

const generateSnapshotLines = lines => `\`\n${'line\n'.repeat(lines)}\``;

const generateExportsSnapshotString = (lines, title = 'a big component 1') =>
  `exports[\`${title}\`] = ${generateSnapshotLines(lines - 1)};`;

const generateExpectInlineSnapsCode = (lines, matcher) =>
  `expect(something).${matcher}(${generateSnapshotLines(lines)});`;

ruleTester.run('no-large-snapshots', rule, {
  valid: [
    {
      filename: 'mock.js',
      code: generateExpectInlineSnapsCode(2, 'toMatchInlineSnapshot'),
    },
    {
      filename: 'mock.js',
      code: generateExpectInlineSnapsCode(
        2,
        'toThrowErrorMatchingInlineSnapshot',
      ),
    },
    {
      // "it should return an empty object for non snapshot files"
      filename: 'mock.jsx',
      code: generateExpectInlineSnapsCode(50, 'toMatchInlineSnapshot'),
    },
    {
      // "should not report if node has fewer lines of code than limit"
      filename: '/mock-component.jsx.snap',
      code: generateExportsSnapshotString(20),
    },
    {
      // "it should not report whitelisted large snapshots"
      filename: '/mock-component.jsx.snap',
      code: generateExportsSnapshotString(58),
      options: [
        {
          whitelistedSnapshots: {
            '/mock-component.jsx.snap': ['a big component 1'],
          },
        },
      ],
    },
  ],
  invalid: [
    {
      filename: 'mock.js',
      code: generateExpectInlineSnapsCode(50, 'toMatchInlineSnapshot'),
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 51 },
        },
      ],
    },
    {
      filename: 'mock.js',
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
    },
    {
      // "should report if node has more than 50 lines of code, and no sizeThreshold option is passed"
      filename: '/mock-component.jsx.snap',
      code: generateExportsSnapshotString(52),
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 52 },
        },
      ],
    },
    {
      // "should report if node has more lines of code than number given in sizeThreshold option"
      filename: '/mock-component.jsx.snap',
      code: generateExportsSnapshotString(100),
      options: [{ maxSize: 70 }],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 70, lineCount: 100 },
        },
      ],
    },
    {
      // "should report if maxSize is zero"
      filename: '/mock-component.jsx.snap',
      code: generateExportsSnapshotString(1),
      options: [{ maxSize: 0 }],
      errors: [
        {
          messageId: 'noSnapshot',
          data: { lineLimit: 0, lineCount: 1 },
        },
      ],
    },
    {
      // "it should report if file is not whitelisted"
      filename: '/mock-component.jsx.snap',
      // code: generateExportsSnapshotString(58),
      code: generateExportsSnapshotString(58),
      options: [
        {
          whitelistedSnapshots: {
            '/another-mock-component.jsx.snap': [/a big component \d+/],
          },
        },
      ],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 58 },
        },
      ],
    },
    {
      // "should not report whitelisted large snapshots based on regexp"
      filename: '/mock-component.jsx.snap',
      code: [
        generateExportsSnapshotString(58, 'a big component w/ text'),
        generateExportsSnapshotString(58, 'a big component 2'),
      ].join('\n\n'),
      options: [
        {
          whitelistedSnapshots: {
            '/mock-component.jsx.snap': [/a big component \d+/],
          },
        },
      ],
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 58 },
        },
      ],
    },
  ],
});

describe('no-large-snapshots', () => {
  const buildBaseNode = type => ({
    type,
    range: [0, 1],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 1 },
    },
  });

  describe('when "whitelistedSnapshots" option contains relative paths', () => {
    it('should throw an exception', () => {
      const { ExpressionStatement = () => {} } = noLargeSnapshots({
        id: 'my-id',
        getFilename: () => '/mock-component.jsx.snap',
        options: [
          {
            whitelistedSnapshots: {
              'mock-component.jsx.snap': [/a big component \d+/],
            },
          },
        ],
        parserOptions: {},
        parserPath: '',
        settings: {},
        getAncestors: () => [],
        getDeclaredVariables: () => [],
        getScope: jest.fn(),
        getSourceCode: jest.fn(),
        markVariableAsUsed: () => false,
        report: jest.fn(),
      });

      expect(() =>
        ExpressionStatement({
          ...buildBaseNode('ExpressionStatement'),
          expression: buildBaseNode('JSXClosingFragment'),
        }),
      ).toThrow(
        'All paths for whitelistedSnapshots must be absolute. You can use JS config and `path.resolve`',
      );
    });
  });
});
