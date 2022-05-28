import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import dedent from 'dedent';
import { espreeParser } from '../../__tests__/test-utils';
import {
  ParsedJestFnCall,
  ResolvedJestFnWithNode,
  createRule,
  getAccessorValue,
  isSupportedAccessor,
  parseJestFnCall,
} from '../../utils';

const findESLintVersion = (): number => {
  const eslintPath = require.resolve('eslint/package.json');

  const eslintPackageJson =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require(eslintPath) as JSONSchemaForNPMPackageJsonFiles;

  if (!eslintPackageJson.version) {
    throw new Error('eslint package.json does not have a version!');
  }

  const [majorVersion] = eslintPackageJson.version.split('.');

  return parseInt(majorVersion, 10);
};

const eslintVersion = findESLintVersion();

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

const isNode = (obj: unknown): obj is TSESTree.Node => {
  if (typeof obj === 'object' && obj !== null) {
    return ['type', 'loc', 'range', 'parent'].every(p => p in obj);
  }

  return false;
};

const rule = createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Fake rule for testing parseJestFnCall',
      recommended: false,
    },
    messages: {
      details: '{{ data }}',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create: context => ({
    CallExpression(node) {
      const jestFnCall = parseJestFnCall(node, context.getScope());

      if (jestFnCall) {
        context.report({
          messageId: 'details',
          node,
          data: {
            data: JSON.stringify(jestFnCall, (key, value) => {
              if (isNode(value)) {
                if (isSupportedAccessor(value)) {
                  return getAccessorValue(value);
                }

                return undefined;
              }

              return value;
            }),
          },
        });
      }
    },
  }),
});

interface TestResolvedJestFnWithNode
  extends Omit<ResolvedJestFnWithNode, 'node'> {
  node: string;
}

interface TestParsedJestFnCall
  extends Omit<ParsedJestFnCall, 'head' | 'members'> {
  head: TestResolvedJestFnWithNode;
  members: string[];
}

const expectedParsedJestFnCallResultData = (result: TestParsedJestFnCall) => ({
  data: JSON.stringify(result),
});

ruleTester.run('nonexistent methods', rule, {
  valid: [
    'describe.something()',
    'describe.me()',
    'test.me()',
    'it.fails()',
    'context()',
    'context.each``()',
    'context.each()',
    'describe.context()',
    'describe.concurrent()()',
    'describe.concurrent``()',
    'describe.every``()',
  ],
  invalid: [],
});

ruleTester.run('esm', rule, {
  valid: [
    {
      code: dedent`
        import { it } from './test-utils';

        it('is not a jest function', () => {});
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import { defineFeature, loadFeature } from "jest-cucumber";

        const feature = loadFeature("some/feature");

        defineFeature(feature, (test) => {
          test("A scenario", ({ given, when, then }) => {});
        });
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import { describe } from './test-utils';

        describe('a function that is not from jest', () => {});
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import { fn as it } from './test-utils';

        it('is not a jest function', () => {});
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import * as jest from '@jest/globals';
        const { it } = jest;

        it('is not supported', () => {});
      `,
      parserOptions: { sourceType: 'module' },
    },
  ],
  invalid: [],
});

if (eslintVersion >= 8) {
  ruleTester.run('esm (dynamic)', rule, {
    valid: [
      {
        code: dedent`
          const { it } = await import('./test-utils');

          it('is not a jest function', () => {});
        `,
        parserOptions: { sourceType: 'module', ecmaVersion: 2022 },
      },
      {
        code: dedent`
          const { it } = await import(\`./test-utils\`);

          it('is not a jest function', () => {});
        `,
        parserOptions: { sourceType: 'module', ecmaVersion: 2022 },
      },
    ],
    invalid: [
      {
        code: dedent`
          const { it } = await import("@jest/globals");
  
          it('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'module', ecmaVersion: 2022 },
        errors: [
          {
            messageId: 'details' as const,
            data: expectedParsedJestFnCallResultData({
              name: 'it',
              type: 'test',
              head: {
                original: 'it',
                local: 'it',
                type: 'import',
                node: 'it',
              },
              members: [],
            }),
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { it } = await import(\`@jest/globals\`);
  
          it('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'module', ecmaVersion: 2022 },
        errors: [
          {
            messageId: 'details' as const,
            data: expectedParsedJestFnCallResultData({
              name: 'it',
              type: 'test',
              head: {
                original: 'it',
                local: 'it',
                type: 'import',
                node: 'it',
              },
              members: [],
            }),
            column: 1,
            line: 3,
          },
        ],
      },
    ],
  });
}

ruleTester.run('cjs', rule, {
  valid: [
    {
      code: dedent`
        const { it } = require('./test-utils');

        it('is not a jest function', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        const { it } = require(\`./test-utils\`);

        it('is not a jest function', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        const { describe } = require('./test-utils');

        describe('a function that is not from jest', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        const { fn: it } = require('./test-utils');

        it('is not a jest function', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        const { fn: it } = require('@jest/globals');

        it('is not considered a test function', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        const { it } = aliasedRequire('@jest/globals');

        it('is not considered a jest function', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        const { it } = require();

        it('is not a jest function', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        const { it } = require(pathToMyPackage);

        it('is not a jest function', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        const { [() => {}]: it } = require('@jest/globals');

        it('is not a jest function', () => {});
      `,
      parserOptions: { sourceType: 'script' },
    },
  ],
  invalid: [],
});

ruleTester.run('typescript', rule, {
  valid: [
    {
      code: dedent`
        const { test };

        test('is not a jest function', () => {});
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
    {
      code: dedent`
        import type { it } from '@jest/globals';

        it('is not a jest function', () => {});
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import jest = require('@jest/globals');
        const { it } = jest;

        it('is not a jest function', () => {});
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        function it(message: string, fn: () => void): void;
        function it(cases: unknown[], message: string, fn: () => void): void;
        function it(...all: any[]): void {}

        it('is not a jest function', () => {});
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        interface it {}
        function it(...all: any[]): void {}

        it('is not a jest function', () => {});
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import { it } from '@jest/globals';
        import { it } from '../it-utils';

        it('is not a jest function', () => {});
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: { sourceType: 'module' },
    },
  ],
  invalid: [
    {
      code: dedent`
        import { it } from '../it-utils';
        import { it } from '@jest/globals';

        it('is a jest function', () => {});
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'it',
            type: 'test',
            head: {
              original: 'it',
              local: 'it',
              type: 'import',
              node: 'it',
            },
            members: [],
          }),
          column: 1,
          line: 4,
        },
      ],
    },
  ],
});
