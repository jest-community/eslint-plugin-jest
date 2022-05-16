import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import {
  createRule,
  getNodeName,
  isDescribeCall,
  isHookCall,
  isTestCaseCall,
  parseJestFnAdvanced,
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
  ],
});
