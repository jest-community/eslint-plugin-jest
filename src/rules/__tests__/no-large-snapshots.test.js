'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-large-snapshots');
const noLargeSnapshots = rule.create;
const { parse } = require('babel-eslint');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});
// lines - 1 to account for the starting newline we always add.
const generateSnapshotNode = ({ lines, title = 'a big component 1' }) =>
  parse(`exports[\`${title}\`] = \`\n${'line\n'.repeat(lines - 1)}\`;`).body[0];

ruleTester.run('no-large-snapshots', rule, {
  valid: [
    {
      filename: 'mock.js',
      code: `expect(something).toMatchInlineSnapshot(\`\n${'line\n'.repeat(
        2,
      )}\`);`,
    },
    {
      filename: 'mock.js',
      code: `expect(something).toThrowErrorMatchingInlineSnapshot(\`\n${'line\n'.repeat(
        2,
      )}\`);`,
    },
  ],
  invalid: [
    {
      filename: 'mock.js',
      code: `expect(something).toMatchInlineSnapshot(\`\n${'line\n'.repeat(
        50,
      )}\`);`,
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 51 },
        },
      ],
    },
    {
      filename: 'mock.js',
      code: `expect(something).toThrowErrorMatchingInlineSnapshot(\`\n${'line\n'.repeat(
        50,
      )}\`);`,
      errors: [
        {
          messageId: 'tooLongSnapshots',
          data: { lineLimit: 50, lineCount: 51 },
        },
      ],
    },
  ],
});

// was not able to use https://eslint.org/docs/developer-guide/nodejs-api#ruletester for these because there is no way to configure RuleTester to run non .js files
describe('no-large-snapshots', () => {
  it('should return an empty object for non snapshot files', () => {
    const mockContext = {
      getFilename: () => 'mock-component.jsx',
      options: [],
    };
    const result = noLargeSnapshots(mockContext);

    expect(result).toEqual({});
  });

  it('should return an object with an ExpressionStatement function for snapshot files', () => {
    const mockContext = {
      getFilename: () => '/mock-component.jsx.snap',
      options: [],
    };

    const result = noLargeSnapshots(mockContext);

    expect(result).toMatchObject({
      ExpressionStatement: expect.any(Function),
    });
  });

  describe('ExpressionStatement function', () => {
    it('should report if node has more than 50 lines of code and no sizeThreshold option is passed', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [],
        report: mockReport,
      };
      const mockNode = {
        loc: {
          start: {
            line: 1,
          },
          end: {
            line: 53,
          },
        },
      };
      noLargeSnapshots(mockContext).ExpressionStatement(mockNode);

      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should report if node has more lines of code than number given in sizeThreshold option', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [{ maxSize: 70 }],
        report: mockReport,
      };
      const mockNode = {
        loc: {
          start: {
            line: 20,
          },
          end: {
            line: 103,
          },
        },
      };
      noLargeSnapshots(mockContext).ExpressionStatement(mockNode);

      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should report if maxSize is zero', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [{ maxSize: 0 }],
        report: mockReport,
      };
      const mockNode = {
        loc: {
          start: {
            line: 1,
          },
          end: {
            line: 2,
          },
        },
      };
      noLargeSnapshots(mockContext).ExpressionStatement(mockNode);

      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should not report if node has fewer lines of code than limit', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [],
        report: mockReport,
      };
      const mockNode = {
        loc: {
          start: {
            line: 1,
          },
          end: {
            line: 18,
          },
        },
      };
      noLargeSnapshots(mockContext).ExpressionStatement(mockNode);

      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should not report whitelisted large snapshots', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [
          {
            whitelistedSnapshots: {
              '/mock-component.jsx.snap': ['a big component 1'],
            },
          },
        ],
        report: mockReport,
      };

      const snapshotNode = generateSnapshotNode({ lines: 58 });

      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode);

      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should report if file is not whitelisted', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [
          {
            whitelistedSnapshots: {
              '/other-mock-component.jsx.snap': [/a big component \d+/],
            },
          },
        ],
        report: mockReport,
      };

      const snapshotNode = generateSnapshotNode({ lines: 58 });

      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode);

      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should not report whitelisted large snapshots based on regexp', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [
          {
            whitelistedSnapshots: {
              '/mock-component.jsx.snap': [/a big component \d+/],
            },
          },
        ],
        report: mockReport,
      };

      const snapshotNode = generateSnapshotNode({ lines: 58 });

      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode);

      expect(mockReport).not.toHaveBeenCalled();

      const otherSnapshotNode = generateSnapshotNode({
        lines: 58,
        title: 'a big component with text',
      });

      noLargeSnapshots(mockContext).ExpressionStatement(otherSnapshotNode);

      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should throw exeption if relative paths are passed as whitelist keys', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [
          {
            whitelistedSnapshots: {
              'mock-component.jsx.snap': [/a big component \d+/],
            },
          },
        ],
        report: mockReport,
      };

      const snapshotNode = generateSnapshotNode({ lines: 58 });

      expect(() =>
        noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode),
      ).toThrow(
        'All paths for whitelistedSnapshots must be absolute. You can use JS config and `path.resolve`',
      );
    });

    it('should not throw exeption if absolute paths are passed as whitelist keys', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => '/mock-component.jsx.snap',
        options: [
          {
            whitelistedSnapshots: {
              '/mock-component.jsx.snap': [/a big component \d+/],
            },
          },
        ],
        report: mockReport,
      };

      const snapshotNode = generateSnapshotNode({ lines: 58 });

      expect(() =>
        noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode),
      ).not.toThrow();
    });
  });
});
