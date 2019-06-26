'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-large-snapshots');

const { parse } = require('babel-eslint');
const noLargeSnapshots = rule.create;

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
      getFilename: () => 'mock-component.jsx.snap',
      options: [],
    };

    const result = noLargeSnapshots(mockContext);

    expect(result).toMatchObject({
      ExpressionStatement: expect.any(Function),
    });
  });

  describe('toMatchSnapshot expression statement and call expressions', () => {
    const {
      body: [{ expression: testNode }],
    } = parse(`it('a big component', () => { });`);

    const {
      body: [{ expression: expectNode }],
    } = parse('expect(something).toMatchSnapshot();');

    afterEach(() => {
      const mockContext = {
        getFilename: () => 'mock-component.test.js',
      };
      noLargeSnapshots(mockContext)['CallExpression:exit'](testNode);
    });
    it('should report if node has more than 50 lines of code and no sizeThreshold option is passed', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => 'mock-component.jsx.snap',
        options: [],
        report: mockReport,
      };

      const snapshotNode = generateSnapshotNode({ lines: 52 });

      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode);

      mockContext.getFilename = () => 'mock.test.js';
      noLargeSnapshots(mockContext).CallExpression(testNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);
      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should report if node has more lines of code than number given in sizeThreshold option', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => 'mock-component.jsx.snap',
        options: [{ maxSize: 70 }],
        report: mockReport,
      };

      const snapshotNode = generateSnapshotNode({ lines: 108 });

      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode);
      mockContext.getFilename = () => 'mock.test.js';
      noLargeSnapshots(mockContext).CallExpression(testNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);

      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should report if maxSize is zero', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => 'mock-component.jsx.snap',
        options: [{ maxSize: 0 }],
        report: mockReport,
      };
      const snapshotNode = generateSnapshotNode({ lines: 1 });

      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode);

      mockContext.getFilename = () => 'mock.test.js';
      noLargeSnapshots(mockContext).CallExpression(testNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);

      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should not report if node has fewer lines of code than limit', () => {
      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => 'mock-component.jsx.snap',
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

      mockContext.getFilename = () => 'mock.test.js';
      noLargeSnapshots(mockContext).CallExpression(testNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);

      expect(mockReport).not.toHaveBeenCalled();
    });

    it('should report on a snapshot in a describe', () => {
      const {
        body: [{ expression: describeNode }],
      } = parse('describe("a category", () => {});');

      const snapshotNode = generateSnapshotNode({
        lines: 58,
        title: 'a category a big component 1',
      });

      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => 'mock-component.jsx.snap',
        options: [],
        report: mockReport,
      };

      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode);

      mockContext.getFilename = () => 'mock.test.js';
      noLargeSnapshots(mockContext).CallExpression(describeNode);
      noLargeSnapshots(mockContext).CallExpression(testNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);
      noLargeSnapshots(mockContext)['CallExpression:exit'](testNode);
      noLargeSnapshots(mockContext)['CallExpression:exit'](describeNode);
      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should report on 2nd snapshot in a test, but not 1st', () => {
      const snapshotNode1 = generateSnapshotNode({ lines: 4 });
      const snapshotNode2 = generateSnapshotNode({ lines: 58 });

      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => 'mock-component.jsx.snap',
        options: [],
        report: mockReport,
      };

      //2 snapshots
      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode1);
      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode2);

      mockContext.getFilename = () => 'mock.test.js';
      noLargeSnapshots(mockContext).CallExpression(testNode);

      //2 expects
      noLargeSnapshots(mockContext).CallExpression(expectNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);

      expect(mockReport).toHaveBeenCalledTimes(1);
      expect(mockReport.mock.calls[0]).toMatchSnapshot();
    });

    it('should report on 2 snapshots in the same test', () => {
      const snapshotNode1 = generateSnapshotNode({ lines: 58 });

      const snapshotNode2 = generateSnapshotNode({
        lines: 58,
        title: 'a big component 2',
      });

      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => 'mock-component.jsx.snap',
        options: [],
        report: mockReport,
      };

      //2 snapshots
      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode1);
      noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode2);

      mockContext.getFilename = () => 'mock.test.js';
      noLargeSnapshots(mockContext).CallExpression(testNode);

      //2 expects
      noLargeSnapshots(mockContext).CallExpression(expectNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);

      expect(mockReport).toHaveBeenCalledTimes(2);
      expect(mockReport.mock.calls).toMatchSnapshot();
    });

    it('should report on 2 snapshots in 2 seperate test cases', () => {
      const snapshots = [
        generateSnapshotNode({ lines: 58 }),
        generateSnapshotNode({
          lines: 58,
          title: 'a big component 2',
        }),
        generateSnapshotNode({
          lines: 58,
          title: 'another big one 1',
        }),
        generateSnapshotNode({
          lines: 58,
          title: 'another big one 2',
        }),
      ];

      const mockReport = jest.fn();
      const mockContext = {
        getFilename: () => 'mock-component.jsx.snap',
        options: [],
        report: mockReport,
      };

      //4 snapshots
      snapshots.forEach(snapshotNode =>
        noLargeSnapshots(mockContext).ExpressionStatement(snapshotNode),
      );

      //first test
      mockContext.getFilename = () => 'mock.test.js';
      noLargeSnapshots(mockContext).CallExpression(testNode);

      //2 expects
      noLargeSnapshots(mockContext).CallExpression(expectNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);

      //exit first test
      noLargeSnapshots(mockContext)['CallExpression:exit'](testNode);

      //2nd test
      const {
        body: [{ expression: testNode2 }],
      } = parse(`it('another big one', () => { });`);
      noLargeSnapshots(mockContext).CallExpression(testNode2);

      //2 expects
      noLargeSnapshots(mockContext).CallExpression(expectNode);
      noLargeSnapshots(mockContext).CallExpression(expectNode);

      //exit 2nd test
      noLargeSnapshots(mockContext)['CallExpression:exit'](testNode2);

      expect(mockReport).toHaveBeenCalledTimes(4);
      expect(mockReport.mock.calls).toMatchSnapshot();
    });
  });
});
