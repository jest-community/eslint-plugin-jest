import type { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { TSESLint, type TSESTree } from '@typescript-eslint/utils';
import dedent from 'dedent';
import { espreeParser } from '../../__tests__/test-utils';
import {
  type ParsedJestFnCall,
  type ResolvedJestFnWithNode,
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
      description: 'Fake rule for testing parseJestFnCall',
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
      const jestFnCall = parseJestFnCall(node, context);

      if (jestFnCall) {
        const sorted = {
          // ...jestFnCall,
          name: jestFnCall.name,
          type: jestFnCall.type,
          head: jestFnCall.head,
          members: jestFnCall.members,
        };

        context.report({
          messageId: 'details',
          node,
          data: {
            data: JSON.stringify(sorted, (_key, value) => {
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

// const sortParsedJestFnCallResults = ()

const expectedParsedJestFnCallResultData = (result: TestParsedJestFnCall) => ({
  data: JSON.stringify({
    name: result.name,
    type: result.type,
    head: result.head,
    members: result.members,
  }),
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
    '/regex/.test()',
    '"something".describe()',
    '[].describe()',
    'new describe().only()',
    '``.test()',
    'test.only``()',
    'test``.only()',
  ],
  invalid: [],
});

ruleTester.run('expect', rule, {
  valid: [
    {
      code: dedent`
        import { expect } from './test-utils';

        expect(x).toBe(y);
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect(x).not.resolves.toBe(x);
      `,
      parserOptions: { sourceType: 'module' },
    },
    // {
    //   code: dedent`
    //     import { expect } from '@jest/globals';
    //
    //     expect(x).not().toBe(x);
    //   `,
    //   parserOptions: { sourceType: 'module' },
    // },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect(x).is.toBe(x);
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect;
        expect(x);
        expect(x).toBe;
        expect(x).not.toBe;
        //expect(x).toBe(x).not();
      `,
      parserOptions: { sourceType: 'module' },
    },
  ],
  invalid: [
    {
      code: 'expect(x).toBe(y);',
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: null,
              local: 'expect',
              type: 'global',
              node: 'expect',
            },
            members: ['toBe'],
          }),
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect.assertions();
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: 'expect',
              local: 'expect',
              type: 'import',
              node: 'expect',
            },
            members: ['assertions'],
          }),
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect(x).toBe(y);
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: 'expect',
              local: 'expect',
              type: 'import',
              node: 'expect',
            },
            members: ['toBe'],
          }),
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect(x).not(y);
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: 'expect',
              local: 'expect',
              type: 'import',
              node: 'expect',
            },
            members: ['not'],
          }),
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect(x).not.toBe(y);
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: 'expect',
              local: 'expect',
              type: 'import',
              node: 'expect',
            },
            members: ['not', 'toBe'],
          }),
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect.assertions();
        expect.hasAssertions();
        expect.anything();
        expect.not.arrayContaining();
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: 'expect',
              local: 'expect',
              type: 'import',
              node: 'expect',
            },
            members: ['assertions'],
          }),
          column: 1,
          line: 3,
        },
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: 'expect',
              local: 'expect',
              type: 'import',
              node: 'expect',
            },
            members: ['hasAssertions'],
          }),
          column: 1,
          line: 4,
        },
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: 'expect',
              local: 'expect',
              type: 'import',
              node: 'expect',
            },
            members: ['anything'],
          }),
          column: 1,
          line: 5,
        },
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'expect',
            type: 'expect',
            head: {
              original: 'expect',
              local: 'expect',
              type: 'import',
              node: 'expect',
            },
            members: ['not', 'arrayContaining'],
          }),
          column: 1,
          line: 6,
        },
      ],
    },
  ],
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
    {
      code: dedent`
        import ByDefault from './myfile';

        ByDefault.sayHello();
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        async function doSomething() {
          const build = await rollup(config);
          build.generate();
        }
      `,
      parserOptions: { sourceType: 'module', ecmaVersion: 2017 },
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

ruleTester.run('global aliases', rule, {
  valid: [
    {
      code: 'xcontext("skip this please", () => {});',
      settings: { jest: { globalAliases: { describe: ['context'] } } },
    },
  ],
  invalid: [
    {
      code: 'context("when there is an error", () => {})',
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'describe',
            type: 'describe',
            head: {
              original: 'describe',
              local: 'context',
              type: 'global',
              node: 'context',
            },
            members: [],
          }),
          column: 1,
          line: 1,
        },
      ],
      settings: { jest: { globalAliases: { describe: ['context'] } } },
    },
    {
      code: 'context.skip("when there is an error", () => {})',
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'describe',
            type: 'describe',
            head: {
              original: 'describe',
              local: 'context',
              type: 'global',
              node: 'context',
            },
            members: ['skip'],
          }),
          column: 1,
          line: 1,
        },
      ],
      settings: { jest: { globalAliases: { describe: ['context'] } } },
    },
    {
      code: dedent`
        context("when there is an error", () => {})
        xcontext("skip this please", () => {});
      `,
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'xdescribe',
            type: 'describe',
            head: {
              original: 'xdescribe',
              local: 'xcontext',
              type: 'global',
              node: 'xcontext',
            },
            members: [],
          }),
          column: 1,
          line: 2,
        },
      ],
      settings: { jest: { globalAliases: { xdescribe: ['xcontext'] } } },
    },
    {
      code: dedent`
        context("when there is an error", () => {})
        describe("when there is an error", () => {})
        xcontext("skip this please", () => {});
      `,
      errors: [
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'describe',
            type: 'describe',
            head: {
              original: 'describe',
              local: 'context',
              type: 'global',
              node: 'context',
            },
            members: [],
          }),
          column: 1,
          line: 1,
        },
        {
          messageId: 'details' as const,
          data: expectedParsedJestFnCallResultData({
            name: 'describe',
            type: 'describe',
            head: {
              original: null,
              local: 'describe',
              type: 'global',
              node: 'describe',
            },
            members: [],
          }),
          column: 1,
          line: 2,
        },
      ],
      settings: { jest: { globalAliases: { describe: ['context'] } } },
    },
  ],
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
    {
      code: dedent`
        import dedent = require('dedent');

        dedent();
      `,
      parser: require.resolve('@typescript-eslint/parser'),
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
