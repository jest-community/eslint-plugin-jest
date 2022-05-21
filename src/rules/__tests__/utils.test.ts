import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import dedent from 'dedent';
import {
  ParsedJestFnCall,
  ResolvedJestFnWithNode,
  TestCaseProperty,
  createRule,
  getAccessorValue,
  getNodeName,
  isDescribeCall,
  isHookCall,
  isSupportedAccessor,
  isTestCaseCall,
  parseJestFnAdvanced,
  parseJestFnCallChain3,
  parseJestFnCall_1,
} from '../utils';
import { espreeParser } from './test-utils';

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

const rule = createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Fake rule for testing AST guards',
      recommended: false,
    },
    messages: {
      details: [
        'callType', //
        'numOfArgs',
        'nodeName',
      ]
        .map(data => `${data}: {{ ${data} }}`)
        .join('\n'),
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create: context => ({
    CallExpression(node) {
      const scope = context.getScope();
      const callType =
        (isDescribeCall(node, scope) && ('describe' as const)) ||
        (isTestCaseCall(node, scope) && ('test' as const)) ||
        (isHookCall(node, scope) && ('hook' as const));

      if (callType) {
        context.report({
          messageId: 'details',
          node,
          data: {
            callType,
            numOfArgs: node.arguments.length,
            nodeName: getNodeName(node),
          },
        });
      }
    },
  }),
});

/**
 * Determines what the expected "node name" should be for the given code by normalizing
 * the line of code to be using dot property accessors and then applying regexp.
 *
 * @param {string} code
 *
 * @return {string}
 */
const expectedNodeName = (code: string): string => {
  const normalizedCode = code
    .replace(/\[["']/gu, '.') //
    .replace(/["']\]/gu, '');

  const [expectedName] = /^[\w.]+/u.exec(normalizedCode) ?? ['NAME NOT FOUND'];

  return expectedName;
};

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

/**
 * Tests the AST utils against the given member expressions both
 * as is and as call expressions.
 *
 * @param {string[]} memberExpressions
 * @param {"describe" | "test"} callType
 * @param {boolean} skip
 */
const testUtilsAgainst = (
  memberExpressions: string[],
  callType: 'describe' | 'test',
  skip = false,
) => {
  if (skip) {
    return;
  }

  ruleTester.run('it', rule, {
    valid: memberExpressions,
    invalid: memberExpressions.map(code => ({
      code: `${code}("works", () => {})`,
      errors: [
        {
          messageId: 'details' as const,
          data: {
            callType,
            numOfArgs: 2,
            nodeName: expectedNodeName(code),
          },
          column: 1,
          line: 1,
        },
      ],
    })),
  });
};

ruleTester.run('it', rule, {
  valid: ['test.for.each()()', 'test.for.each``()', 'test.each.each()()'],
  invalid: [],
});

testUtilsAgainst(
  [
    'it["concurrent"]["skip"]',
    'it["concurrent"].skip',
    'it.concurrent["skip"]',
    'it.concurrent.skip',

    'it["concurrent"]["only"]',
    'it["concurrent"].only',
    'it.concurrent["only"]',
    'it.concurrent.only',

    'it["skip"]["each"]()',
    'it["skip"].each()',
    'it.skip["each"]()',
    'it.skip.each()',

    'it["skip"]["each"]``',
    'it["skip"].each``',
    'it.skip["each"]``',
    'it.skip.each``',

    'it["only"]["each"]()',
    'it["only"].each()',
    'it.only["each"]()',
    'it.only.each()',

    'it["only"]["each"]``',
    'it["only"].each``',
    'it.only["each"]``',
    'it.only.each``',

    'xit["each"]()',
    'xit.each()',

    'xit["each"]``',
    'xit.each``',

    'fit["each"]()',
    'fit.each()',

    'fit["each"]``',
    'fit.each``',

    'it["skip"]',
    'it.skip',

    'it["only"]',
    'it.only',

    'it["each"]()',
    'it.each()',

    'it["each"]``',
    'it.each``',

    'fit',
    'xit',
    'it',
  ],
  'test',
  false,
);

testUtilsAgainst(
  [
    'test["concurrent"]["skip"]',
    'test["concurrent"].skip',
    'test.concurrent["skip"]',
    'test.concurrent.skip',

    'test["concurrent"]["only"]',
    'test["concurrent"].only',
    'test.concurrent["only"]',
    'test.concurrent.only',

    'test["skip"]["each"]()',
    'test["skip"].each()',
    'test.skip["each"]()',
    'test.skip.each()',

    'test["skip"]["each"]``',
    'test["skip"].each``',
    'test.skip["each"]``',
    'test.skip.each``',

    'test["only"]["each"]()',
    'test["only"].each()',
    'test.only["each"]()',
    'test.only.each()',

    'test["only"]["each"]``',
    'test["only"].each``',
    'test.only["each"]``',
    'test.only.each``',

    'xtest["each"]()',
    'xtest.each()',

    'xtest["each"]``',
    'xtest.each``',

    'test["skip"]',
    'test.skip',

    'test["only"]',
    'test.only',

    'test["each"]()',
    'test.each()',

    'test["each"]``',
    'test.each``',

    'xtest',
    'test',
  ],
  'test',
  false,
);

testUtilsAgainst(
  [
    'describe["skip"]["each"]()',
    'describe["skip"].each()',
    'describe.skip["each"]()',
    'describe.skip.each()',

    'describe["skip"]["each"]``',
    'describe["skip"].each``',
    'describe.skip["each"]``',
    'describe.skip.each``',

    'describe["only"]["each"]()',
    'describe["only"].each()',
    'describe.only["each"]()',
    'describe.only.each()',

    'describe["only"]["each"]``',
    'describe["only"].each``',
    'describe.only["each"]``',
    'describe.only.each``',

    'xdescribe["each"]()',
    'xdescribe.each()',

    'xdescribe["each"]``',
    'xdescribe.each``',

    'fdescribe["each"]()',
    'fdescribe.each()',

    'fdescribe["each"]``',
    'fdescribe.each``',

    'describe["skip"]',
    'describe.skip',

    'describe["only"]',
    'describe.only',

    'describe["each"]()',
    'describe.each()',

    'describe["each"]``',
    'describe.each``',

    'fdescribe',
    'xdescribe',
    'describe',
  ],
  'describe',
  false,
);

const hooks = ['beforeAll', 'beforeEach', 'afterEach', 'afterAll'];

ruleTester.run('hooks', rule, {
  valid: [...hooks, 'beforeAll.each(() => {})'],
  invalid: hooks.map(hook => ({
    code: `${hook}(() => {})`,
    errors: [
      {
        messageId: 'details' as const,
        data: {
          callType: 'hook',
          numOfArgs: 1,
          nodeName: expectedNodeName(hook),
        },
        column: 1,
        line: 1,
      },
    ],
  })),
});

describe('reference checking', () => {
  ruleTester.run('general', rule, {
    valid: [
      "([]).skip('is not a jest function', () => {});",
      {
        code: dedent`
          const test = () => {};

          test('is not a jest function', () => {});
        `,
      },
      {
        code: dedent`
          (async () => {
            const { test } = await Promise.resolve();

            test('is not a jest function', () => {});
          })();
        `,
        parserOptions: { sourceType: 'module', ecmaVersion: 2017 },
      },
    ],
    invalid: [
      {
        code: 'describe()',
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'describe',
              numOfArgs: 0,
              nodeName: 'describe',
            },
            column: 1,
            line: 1,
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
    ],
    invalid: [
      {
        code: dedent`
          import { describe } from '@jest/globals';

          describe('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'describe',
              numOfArgs: 2,
              nodeName: 'describe',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          import { describe } from '@jest/globals';

          describe.skip('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'describe',
              numOfArgs: 2,
              nodeName: 'describe.skip',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          import { it } from '@jest/globals';

          it('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'it',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          import { beforeEach } from '@jest/globals';

          beforeEach(() => {});
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'hook',
              numOfArgs: 1,
              nodeName: 'beforeEach',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          import { beforeEach as it } from '@jest/globals';

          it(() => {});
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'hook',
              numOfArgs: 1,
              nodeName: 'it',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          import { it as testThis, xit as skipThis } from '@jest/globals';

          testThis('is a jest function', () => {});
          skipThis('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'testThis',
            },
            column: 1,
            line: 3,
          },
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'skipThis',
            },
            column: 1,
            line: 4,
          },
        ],
      },
      {
        code: dedent`
          import { it as xit, xit as skipThis } from '@jest/globals';

          xit('is a jest function', () => {});
          skipThis('is a jest function');
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'xit',
            },
            column: 1,
            line: 3,
          },
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 1,
              nodeName: 'skipThis',
            },
            column: 1,
            line: 4,
          },
        ],
      },
      {
        code: dedent`
          import { test as testWithJest } from '@jest/globals';
          const test = () => {};

          describe(test, () => {
            testWithJest('should do something good', () => {
              expect(test({})).toBeDefined();
            });
          });
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'describe',
              numOfArgs: 2,
              nodeName: 'describe',
            },
            column: 1,
            line: 4,
          },
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'testWithJest',
            },
            column: 3,
            line: 5,
          },
        ],
      },
    ],
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
              data: {
                callType: 'test',
                numOfArgs: 2,
                nodeName: 'it',
              },
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
              data: {
                callType: 'test',
                numOfArgs: 2,
                nodeName: 'it',
              },
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
    invalid: [
      {
        code: dedent`
          const { describe } = require('@jest/globals');

          describe('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'describe',
              numOfArgs: 2,
              nodeName: 'describe',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { describe } = require('@jest/globals');

          describe.skip('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'describe',
              numOfArgs: 2,
              nodeName: 'describe.skip',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { describe } = require(\`@jest/globals\`);

          describe('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'describe',
              numOfArgs: 2,
              nodeName: 'describe',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { it } = require('@jest/globals');

          it('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'it',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { beforeEach } = require('@jest/globals');

          beforeEach(() => {});
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'hook',
              numOfArgs: 1,
              nodeName: 'beforeEach',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { beforeEach: it } = require('@jest/globals');

          it(() => {});
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'hook',
              numOfArgs: 1,
              nodeName: 'it',
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { it: testThis, xit: skipThis } = require('@jest/globals');

          testThis('is a jest function', () => {});
          skipThis('is a jest function', () => {});
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'testThis',
            },
            column: 1,
            line: 3,
          },
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'skipThis',
            },
            column: 1,
            line: 4,
          },
        ],
      },
      {
        code: dedent`
          const { it: xit, xit: skipThis } = require('@jest/globals');

          xit('is a jest function', () => {});
          skipThis('is a jest function');
      `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'xit',
            },
            column: 1,
            line: 3,
          },
          {
            messageId: 'details' as const,
            data: {
              callType: 'test',
              numOfArgs: 1,
              nodeName: 'skipThis',
            },
            column: 1,
            line: 4,
          },
        ],
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
            data: {
              callType: 'test',
              numOfArgs: 2,
              nodeName: 'it',
            },
            column: 1,
            line: 4,
          },
        ],
      },
    ],
  });
});

const rule2 = createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Fake rule for testing AST guards',
      recommended: false,
    },
    messages: {
      details: [
        'type', //
        'name',
        'imported',
        'numOfArgs',
      ]
        .map(data => `${data}: {{ ${data} }}`)
        .join('\n'),
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create: context => ({
    CallExpression(node) {
      const scope = context.getScope();
      const parsed = parseJestFnAdvanced(node, scope);

      if (parsed) {
        context.report({
          messageId: 'details',
          node,
          data: {
            numOfArgs: node.arguments.length,
            ...parsed,
            node: null,
          },
        });
      }
    },
  }),
});

const testJestFn = (name: string, type: string) => {
  ruleTester.run(`reference checking (${name})`, rule2, {
    valid: [
      name,
      {
        code: dedent`
          import { ${name} } from '../test-fns';

          ${name}();
        `,
        parserOptions: { sourceType: 'module' },
      },
      {
        code: dedent`
          (async () => {
            const { ${name} } = await Promise.resolve();

            ${name}();
          })();
        `,
        parserOptions: { sourceType: 'module', ecmaVersion: 2017 },
      },
    ],
    invalid: [
      {
        code: `${name}()`,
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              original: null,
              imported: false,
            },
            column: 1,
            line: 1,
          },
        ],
      },
      {
        code: dedent`
          import { ${name} } from '@jest/globals';

          ${name}();
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          import { ${name} as somethingElse } from '@jest/globals';

          somethingElse();
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          import { ${name} as somethingElse } from '@jest/globals';

          ${name}();
          somethingElse();
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: false,
            },
            column: 1,
            line: 3,
          },
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 4,
          },
        ],
      },
      {
        code: dedent`
          import { ${name}, ${name} as somethingElse } from '@jest/globals';

          ${name}();
          somethingElse();
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 3,
          },
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 4,
          },
        ],
      },
      {
        code: dedent`
          const { ${name} } = require('@jest/globals');

          ${name}();
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { ${name}: somethingElse } = require('@jest/globals');

          somethingElse();
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 3,
          },
        ],
      },
      {
        code: dedent`
          const { ${name}: somethingElse } = require('@jest/globals');

          ${name}();
          somethingElse();
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: false,
            },
            column: 1,
            line: 3,
          },
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 4,
          },
        ],
      },
      {
        code: dedent`
          const { ${name}, ${name}: somethingElse } = require('@jest/globals');

          ${name}();
          somethingElse();
        `,
        parserOptions: { sourceType: 'script' },
        errors: [
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 3,
          },
          {
            messageId: 'details' as const,
            data: {
              type,
              name,
              numOfArgs: 0,
              imported: true,
            },
            column: 1,
            line: 4,
          },
        ],
      },
    ],
  });
};

testJestFn('describe', 'describe');
testJestFn('fdescribe', 'describe');
testJestFn('xdescribe', 'describe');

testJestFn('fit', 'test');
testJestFn('it', 'test');
testJestFn('test', 'test');
testJestFn('xtest', 'test');

testJestFn('beforeAll', 'hook');
testJestFn('beforeEach', 'hook');
testJestFn('afterEach', 'hook');
testJestFn('afterAll', 'hook');

testJestFn('expect', 'expect');

ruleTester.run('more reference checking', rule2, {
  valid: [
    {
      code: dedent`
        import { it } from '../test-fns';

        it.skip();
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        (async () => {
          const { it } = await Promise.resolve();

          it.skip();
        })();
      `,
      parserOptions: { sourceType: 'module', ecmaVersion: 2017 },
    },
  ],
  invalid: [
    {
      code: dedent`
        import { it } from '@jest/globals';

        it.skip();
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { it as somethingElse } from '@jest/globals';

        somethingElse.skip();
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { describe as somethingElse } from '@jest/globals';

        describe();
        somethingElse.skip();
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 3,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        const { it } = require('@jest/globals');

        it.skip();
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const { it: somethingElse } = require('@jest/globals');

        somethingElse.skip();
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const { it: somethingElse } = require('@jest/globals');

        it.only();
        somethingElse.skip();
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 3,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        const { it, it: somethingElse } = require('@jest/globals');

        it.skip();
        somethingElse.skip();
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 3,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        import { describe } from '@jest/globals';

        describe.each()()
        describe.only.each()()

        describe.each\`\`()
        describe.only.each\`\`()
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 3,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 4,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 6,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 7,
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
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 1,
            imported: true,
          },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        import { expect } from '@jest/globals';

        expect.hasAssertions();
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 0,
            imported: true,
          },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: 'it.skip()',
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        describe();
        somethingElse.skip();
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it.only();
        somethingElse.skip();
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        describe.each()()
        describe.only.each()()

        describe.each\`\`()
        describe.only.each\`\`()
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 1,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 2,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 4,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'describe',
            name: 'describe',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 5,
        },
      ],
    },
    {
      code: 'expect(x).toBe(y)',
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 1,
            imported: false,
          },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: 'expect.hasAssertions()',
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 0,
            imported: false,
          },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        const myFn = () => {
          Promise.resolve().then(() => {
            expect(true).toBe(false);
          });
        };

        it('it1', () => {
          somePromise.then(() => {
            expect(someThing).toEqual(true);
          });
        });
      `,
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 1,
            imported: false,
          },
          column: 5,
          line: 3,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'test',
            name: 'it',
            numOfArgs: 2,
            imported: false,
          },
          column: 1,
          line: 7,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 1,
            imported: false,
          },
          column: 5,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        expect.extend({
          toResolve(obj) {
            this.isNot
              ? expect(obj).toBe(true)
              : anotherCondition
              ? expect(obj).resolves.not.toThrow()
              : expect(obj).toBe(false)
          }
        });
      `,
      errors: [
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 1,
            imported: false,
          },
          column: 1,
          line: 1,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 1,
            imported: false,
          },
          column: 9,
          line: 4,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 1,
            imported: false,
          },
          column: 9,
          line: 6,
        },
        {
          messageId: 'details' as const,
          data: {
            type: 'expect',
            name: 'expect',
            numOfArgs: 1,
            imported: false,
          },
          column: 9,
          line: 7,
        },
      ],
    },
  ],
});

// -----------------------------------------------------------------------------

const rule3 = createRule<[{ properties: readonly string[] }], 'details'>({
  name: __filename,
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Fake rule for testing AST guards',
      recommended: false,
    },
    messages: {
      details: 'chain: {{ chain }}',
      // details: [
      //   'subject', //
      //   'modifier',
      //   'each',
      // ]
      //   .map(data => `${data}: {{ ${data} }}`)
      //   .join('\n'),
    },
    schema: [
      {
        type: 'object',
        properties: {
          properties: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    ],
    type: 'problem',
  },
  defaultOptions: [{ properties: [] }],
  create: context => ({
    CallExpression(node) {
      // if (node.parent.type !== AST_NODE_TYPES.ExpressionStatement) {
      //   return;
      // }

      // const chain = parseJestFnCallChain3(node);
      const chain = parseJestFnCallChain3(node, context.options[0]?.properties);

      if (chain) {
        context.report({
          messageId: 'details',
          node,
          data: {
            chain: JSON.stringify(chain.map(c => getAccessorValue(c))),
            // subject: getAccessorValue(chain.subject),
            // modifier: chain.modifier ? getAccessorValue(chain.modifier) : null,
            // each: chain.each ? getAccessorValue(chain.each) : null,
          },
        });
      }
    },
  }),
});

// ruleTester.run('nonexistent methods', rule, {
//   valid: [
//     'describe.something()',
//     'describe.me()',
//     'test.me()',
//     'it.fails()',
//     'context()',
//     'context.each``()',
//     'context.each()',
//     'describe.context()',
//     'describe.concurrent()()',
//     'describe.concurrent``()',
//     'describe.every``()',
//   ],
//   invalid: [],
// });

ruleTester.run('nonexistent methods3', rule3, {
  valid: [
    // 'describe.something()',
    // 'describe.me()',
    // 'test.me()',
    // 'it.fails()',
    // 'context()',
    // 'context.each``()',
    // 'context.each()',
    // 'describe.context()',
    // 'describe.concurrent()()',
    // 'describe.concurrent``()',
    // 'describe.every``()',
    // 'it.only().fails()',
  ],
  invalid: [],
});

interface ParsedJestFnCallChain2 {
  subject: string;
  modifier?: string;
  each?: string;
}

type TestPair = [memberExpression: string, expectedChain: string[]];
// type TestPair = [string, ParsedJestFnCallChain2];
// /**
//  * Tests the AST utils against the given member expressions both
//  * as is and as call expressions.
//  */
// const testUtilsAgainst2 = (
//   memberExpressions: TestPair[],
//   properties: readonly string[],
//   skip = false,
// ) => {
//   if (skip) {
//     return;
//   }
//
//   ruleTester.run('it', rule3, {
//     valid: memberExpressions.map(([code]) => code),
//     invalid: memberExpressions.map(([code, results]) => ({
//       code: `${code}("works", () => {})`,
//       options: [{ properties }] as const,
//       errors: [
//         {
//           messageId: 'details' as const,
//           data: results as any,
//           column: 1,
//           line: 1,
//         },
//       ],
//     })),
//   });
// };
//
// testUtilsAgainst2(
//   [
//     // ['it.concurrent.skip', { subject: 'it', modifier: 'skip' }],
//     // ['it.concurrent.only', { subject: 'it', modifier: 'only' }],
//
//     ['it.skip.each()', { subject: 'it', modifier: 'skip', each: 'each' }],
//     ['it.only.each()', { subject: 'it', modifier: 'only', each: 'each' }],
//
//     // ['it.skip.each``', { subject: 'it', modifier: 'skip', each: 'each' }],
//     // ['it.only.each``', { subject: 'it', modifier: 'only', each: 'each' }],
//
//     // ['xit.each``', { subject: 'xit', modifier: null, each: 'each' }],
//     // ['fit.each``', { subject: 'fit', modifier: null, each: 'each' }],
//
//     ['xit.each()', { subject: 'xit', modifier: null, each: 'each' }],
//     ['fit.each()', { subject: 'fit', modifier: null, each: 'each' }],
//
//     ['it.skip', { subject: 'it', modifier: 'skip', each: null }],
//     ['it.only', { subject: 'it', modifier: 'only', each: null }],
//
//     ['xit', { subject: 'xit', modifier: null, each: null }],
//     ['fit', { subject: 'fit', modifier: null, each: null }],
//     ['it', { subject: 'it', modifier: null, each: null }],
//   ],
//   Object.keys(TestCaseProperty),
// );

/**
 * Tests the AST utils against the given member expressions both
 * as is and as call expressions.
 */
const testUtilsAgainst3 = (
  memberExpressions: TestPair[],
  properties: readonly string[],
  skip = false,
) => {
  if (skip) {
    return;
  }

  ruleTester.run('it3', rule3, {
    valid: memberExpressions.map(([code]) => code),
    invalid: memberExpressions.map(([code, chain]) => ({
      code: `${code}("works", () => {})`,
      options: [{ properties }] as const,
      errors: [
        {
          messageId: 'details' as const,
          data: { chain: JSON.stringify(chain) },
          column: 1,
          line: 1,
        },
      ],
    })),
  });
};

testUtilsAgainst3(
  [
    ['it.concurrent.skip', ['it', 'concurrent', 'skip']],
    ['it.concurrent.only', ['it', 'concurrent', 'only']],

    ['it.skip.each()', ['it', 'skip', 'each']],
    ['it.only.each()', ['it', 'only', 'each']],

    ['it.skip.each``', ['it', 'skip', 'each']],
    ['it.only.each``', ['it', 'only', 'each']],

    ['xit.each``', ['xit', 'each']],
    ['fit.each``', ['fit', 'each']],

    ['fit.each()', ['fit', 'each']],
    ['xit.each()', ['xit', 'each']],

    ['it.only', ['it', 'only']],
    ['it.skip', ['it', 'skip']],

    ['fit', ['fit']],
    ['xit', ['xit']],
    ['it', ['it']],
  ],
  Object.keys(TestCaseProperty),
  true,
);

// testUtilsAgainst2(
//   [
//     'beforeAll', //
//     'beforeEach',
//     'afterEach',
//     'afterAll',
//   ],
//   [],
// );

// -----------------------------------------------------------------------------

const isNode = (obj: unknown): obj is TSESTree.Node => {
  if (typeof obj === 'object' && obj !== null) {
    return ['type', 'loc', 'range', 'parent'].every(p => p in obj);
  }

  return false;
};

const rule4 = createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Fake rule for testing AST guards',
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
      // if (node.parent.type !== AST_NODE_TYPES.ExpressionStatement) {
      //   return;
      // }

      const parsed = parseJestFnCall_1(node, context.getScope());

      if (parsed) {
        context.report({
          messageId: 'details',
          node,
          data: {
            data: JSON.stringify(parsed, (key, value) => {
              if (isNode(value)) {
                if (isSupportedAccessor(value)) {
                  return getAccessorValue(value);
                }

                return undefined;
              }

              return value;
            }),
            // subject: getAccessorValue(chain.subject),
            // modifier: chain.modifier ? getAccessorValue(chain.modifier) : null,
            // each: chain.each ? getAccessorValue(chain.each) : null,
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

const buildParsedJestFnCallCases = (
  code: string,
  type: TestParsedJestFnCall['type'],
): [
  valid: Array<TSESLint.ValidTestCase<unknown[]> | string>,
  invalid: Array<TSESLint.InvalidTestCase<'details', unknown[]>>,
] => {
  const [node, ...members] = expectedNodeName(code).split('.');

  return [
    [
      // global
      code,
      // imported
      {
        code: dedent`
          import { ${node} } from '@jest/globals';

          ${code}
        `,
        parserOptions: { sourceType: 'module' },
      },
      // imported (aliased)
      {
        code: dedent`
          import { ${node} as aliased } from '@jest/globals';

          ${code.replace(node, 'aliased')}
        `,
        parserOptions: { sourceType: 'module' },
      },
    ],
    [
      // global
      {
        code: `${code}("works", () => {})`,
        errors: [
          {
            messageId: 'details' as const,
            data: expectedParsedJestFnCallResultData({
              head: {
                original: null,
                local: node,
                type: 'global',
                node,
              },
              members,
              type,
            }),
            column: 1,
            line: 1,
          },
        ],
      },
      // import
      {
        code: dedent`
          import { ${node} } from '@jest/globals';

          ${code}("works", () => {})
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: expectedParsedJestFnCallResultData({
              head: {
                original: node,
                local: node,
                type: 'import',
                node,
              },
              members,
              type,
            }),
            column: 1,
            line: 3,
          },
        ],
      },
      // import (aliased)
      {
        code: dedent`
          import { ${node} as aliased } from '@jest/globals';

          ${code.replace(node, 'aliased')}("works", () => {})
        `,
        parserOptions: { sourceType: 'module' },
        errors: [
          {
            messageId: 'details' as const,
            data: expectedParsedJestFnCallResultData({
              head: {
                original: node,
                local: 'aliased',
                type: 'import',
                node: 'aliased',
              },
              members,
              type,
            }),
            column: 1,
            line: 3,
          },
        ],
      },
    ],
  ];
};

/**
 * Tests the AST utils against the given member expressions both
 * as is and as call expressions.
 */
const testParsingJestFnCall = (
  memberExpressions: string[],
  type: TestParsedJestFnCall['type'],
  skip = false,
) => {
  if (skip) {
    return;
  }

  const [valid, invalid] = memberExpressions
    .map(code => buildParsedJestFnCallCases(code, type))
    .reduce(
      ([valid, invalid], [nv, ni]) => [
        [...valid, ...nv],
        [...invalid, ...ni],
      ],
      [[], []],
    );

  ruleTester.run('parseJestFnCall', rule4, { valid, invalid });
};

ruleTester.run('parseJestFnCall', rule4, {
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

    'afterAll.each()',
    'afterAll.each()()',
    'afterAll.each``()',
    'afterAll().each()',
    'beforeAll.only()',

    'describe.failing()',
    'describe().failing()',
    'describe.failing.only()',
    'describe.each.only()',
    'describe.each().only',

    'test.concurrent.each.only(table)',
    'test.concurrent.failing()',
    'test.failing.only()',
    'test.todo.failing()',

    'it.failing.only()',
    'fit.failing.skip()',
    'fit.failing().skip()',
    'fit.failing().skip',
    'fit().failing().skip',
    'it.skip().failing',
    'it().skip.failing()',
    'xtest.failing.each()',
    'xtest.failing.each()()',
    'xtest().failing.each()()',
    'xtest.failing.each``()',

    'it.concurrent.each.only(table)',
    'it.concurrent().each.only(table)',
    'xit.concurrent.failing',

    'it.only().fails()',
    'it.only().fails().skip()',
    'it.only().skip().fails()',
    'describe.each().only()',
    'describe.skip().only()',

    {
      code: dedent`
        import { describe } from '../test-fns';

        describe.only();
      `,
      parserOptions: { sourceType: 'module' },
    },
  ],
  invalid: [],
});

testParsingJestFnCall(
  [
    'afterAll',
    'afterEach',
    'beforeAll',
    'beforeEach',

    'describe',
    'describe.each(table)',
    'describe.only',
    'describe.only.each(table)',
    'describe.skip',
    'describe.skip.each(table)',

    'test',
    'test.concurrent',
    'test.concurrent.each(table)',
    'test.concurrent.only.each(table)',
    'test.concurrent.skip.each(table)',
    'test.each(table)',
    'test.failing',
    'test.only.failing',
    'test.skip.failing',
    'test.only',
    'test.only.each(table)',
    'test.skip',
    'test.skip.each(table)',
    'test.todo',
    'fdescribe.each(table)',
    'fdescribe.each`table`',
    'xdescribe.each(table)',
    'xdescribe.each`table`',
    'it.only.failing',
    'fit.failing',
    'it.skip.failing',
    'xit.failing',
    'xtest.failing',
    'it.only',
    'fit',
    'it.only.each(table)',
    'fit.each(table)',
    'it.only.each`table`',
    'fit.each`table`',
    'it.skip',
    'xit',
    'xtest',
    'it.skip.each(table)',
    'xit.each(table)',
    'xtest.each(table)',
    'it.skip.each`table`',
    'xit.each`table`',
    'xtest.each`table`',
    'fdescribe',
    'xdescribe',

    'it',
    'it.concurrent',
    'it.concurrent.each(table)',
    'it.concurrent.only.each(table)',
    'it.concurrent.skip.each(table)',
    'it.each(table)',
    'it.each`table`',
    'it.failing',
    'it.todo',
  ],
  '',
  true,
);

testParsingJestFnCall(
  [
    'it["concurrent"]["skip"]',
    'it["concurrent"].skip',
    'it.concurrent["skip"]',
    'it.concurrent.skip',

    'it["concurrent"]["only"]',
    'it["concurrent"].only',
    'it.concurrent["only"]',
    'it.concurrent.only',

    'it["skip"]["each"]()',
    'it["skip"].each()',
    'it.skip["each"]()',
    'it.skip.each()',

    'it["skip"]["each"]``',
    'it["skip"].each``',
    'it.skip["each"]``',
    'it.skip.each``',

    'it["only"]["each"]()',
    'it["only"].each()',
    'it.only["each"]()',
    'it.only.each()',

    'it["only"]["each"]``',
    'it["only"].each``',
    'it.only["each"]``',
    'it.only.each``',

    'xit["each"]()',
    'xit.each()',

    'xit["each"]``',
    'xit.each``',

    'fit["each"]()',
    'fit.each()',

    'fit["each"]``',
    'fit.each``',

    'it["skip"]',
    'it.skip',

    'it["only"]',
    'it.only',

    'it["each"]()',
    'it.each()',

    'it["each"]``',
    'it.each``',

    'fit',
    'xit',
    'it',
  ],
  'test',
  false,
);

testParsingJestFnCall(
  [
    'test["concurrent"]["skip"]',
    'test["concurrent"].skip',
    'test.concurrent["skip"]',
    'test.concurrent.skip',

    'test["concurrent"]["only"]',
    'test["concurrent"].only',
    'test.concurrent["only"]',
    'test.concurrent.only',

    'test["skip"]["each"]()',
    'test["skip"].each()',
    'test.skip["each"]()',
    'test.skip.each()',

    'test["skip"]["each"]``',
    'test["skip"].each``',
    'test.skip["each"]``',
    'test.skip.each``',

    'test["only"]["each"]()',
    'test["only"].each()',
    'test.only["each"]()',
    'test.only.each()',

    'test["only"]["each"]``',
    'test["only"].each``',
    'test.only["each"]``',
    'test.only.each``',

    'xtest["each"]()',
    'xtest.each()',

    'xtest["each"]``',
    'xtest.each``',

    'test["skip"]',
    'test.skip',

    'test["only"]',
    'test.only',

    'test["each"]()',
    'test.each()',

    'test["each"]``',
    'test.each``',

    'xtest',
    'test',
  ],
  'test',
  false,
);

testParsingJestFnCall(
  [
    'describe["skip"]["each"]()',
    'describe["skip"].each()',
    'describe.skip["each"]()',
    'describe.skip.each()',

    'describe["skip"]["each"]``',
    'describe["skip"].each``',
    'describe.skip["each"]``',
    'describe.skip.each``',

    'describe["only"]["each"]()',
    'describe["only"].each()',
    'describe.only["each"]()',
    'describe.only.each()',

    'describe["only"]["each"]``',
    'describe["only"].each``',
    'describe.only["each"]``',
    'describe.only.each``',

    'xdescribe["each"]()',
    'xdescribe.each()',

    'xdescribe["each"]``',
    'xdescribe.each``',

    'fdescribe["each"]()',
    'fdescribe.each()',

    'fdescribe["each"]``',
    'fdescribe.each``',

    'describe["skip"]',
    'describe.skip',

    'describe["only"]',
    'describe.only',

    'describe["each"]()',
    'describe.each()',

    'describe["each"]``',
    'describe.each``',

    'fdescribe',
    'xdescribe',
    'describe',
  ],
  'describe',
  false,
);

// testParsingJestFnCall(
//   [
//     [
//       'describe',
//       {
//         head: {
//           original: null,
//           local: 'describe',
//           type: 'global',
//           node: 'describe',
//         },
//         members: [],
//       },
//     ],
//     [
//       'describe.only',
//       {
//         head: {
//           original: null,
//           local: 'describe',
//           type: 'global',
//           node: 'describe',
//         },
//         members: ['only'],
//       },
//     ],
//     [
//       'describe.skip',
//       {
//         head: {
//           original: null,
//           local: 'describe',
//           type: 'global',
//           node: 'describe',
//         },
//         members: ['skip'],
//       },
//     ],
//     // [
//     //   'describe.each()',
//     //   {
//     //     head: {
//     //       original: null,
//     //       local: 'describe',
//     //       type: 'global',
//     //       node: 'describe',
//     //     },
//     //     members: ['each'],
//     //   },
//     // ],
//   ],
//   false,
// );

// ruleTester.run('nonexistent methods4', rule4, {
//   valid: [
//     // 'describe.something()',
//     // 'describe.me()',
//     // 'test.me()',
//     // 'it.fails()',
//     // 'context()',
//     // 'context.each``()',
//     // 'context.each()',
//     // 'describe.context()',
//     // 'describe.concurrent()()',
//     // 'describe.concurrent``()',
//     // 'describe.every``()',
//     // 'it.only().fails()',
//   ],
//   invalid: [
//     {
//       code: 'describe()',
//       errors: [
//         {
//           messageId: 'details',
//           data: {
//             data: JSON.stringify({
//               head: {
//                 original: null,
//                 local: 'describe',
//                 type: 'global',
//               },
//               members: [],
//             }),
//           },
//         },
//       ],
//     },
//   ],
// });
