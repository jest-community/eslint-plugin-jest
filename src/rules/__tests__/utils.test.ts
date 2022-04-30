import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import {
  createRule,
  getNodeName,
  isDescribeCall,
  isHookCall,
  isTestCaseCall,
} from '../utils';
import { espreeParser } from './test-utils';

const findESLintVersion = (): number => {
  try {
    const eslintPath = require.resolve('eslint/package.json');

    const eslintPackageJson =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(eslintPath) as JSONSchemaForNPMPackageJsonFiles;

    if (eslintPackageJson.version) {
      const [majorVersion] = eslintPackageJson.version.split('.');

      return parseInt(majorVersion, 10);
    }
  } catch {}

  throw new Error('Unable to detect ESLint version!');
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
);

const hooks = ['beforeAll', 'beforeEach', 'afterEach', 'afterAll'];

ruleTester.run('hooks', rule, {
  valid: [...hooks, 'beforeAll.each(() => {})'],
  invalid: hooks.map(code => ({
    code: `${code}(() => {})`,
    errors: [
      {
        messageId: 'details' as const,
        data: {
          callType: 'hook',
          numOfArgs: 1,
          nodeName: expectedNodeName(code),
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
    ],
    invalid: [],
  });
});
