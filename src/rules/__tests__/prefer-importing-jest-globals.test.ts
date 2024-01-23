import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../prefer-importing-jest-globals';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
});

ruleTester.run('prefer-importing-jest-globals', rule, {
  valid: [
    {
      code: dedent`
        // with import
        import { test, expect } from '@jest/globals';
        test('should pass', () => {
            expect(true).toBeDefined();
        });
        `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        // with require
        const { test, expect } = require('@jest/globals');
        test('should pass', () => {
            expect(true).toBeDefined();
        });
        `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import { it as itChecks } from '@jest/globals';
        itChecks("foo");
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        const { test } = require('@jest/globals');
        test("foo");
      `,
      parserOptions: { sourceType: 'module' },
    },
  ],
  invalid: [
    {
      code: dedent`
        #!/usr/bin/env node
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        #!/usr/bin/env node
        const { describe, test, expect } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
    `,
      parserOptions: { sourceType: 'module' },
      errors: [
        { endColumn: 3, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        // with comment above
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        // with comment above
        const { describe, test, expect } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
    `,
      parserOptions: { sourceType: 'module' },
      errors: [
        { endColumn: 3, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        'use strict';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        'use strict';
        const { describe, test, expect } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
    `,
      parserOptions: { sourceType: 'module' },
      errors: [
        { endColumn: 3, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        import { test } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        import { test, describe, expect } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
    `,
      parserOptions: { sourceType: 'module' },
      errors: [
        { endColumn: 3, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        const { test } = require('@jest/globals');
        describe("suite", () => { 
          test("foo"); 
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        const { test, describe, expect } = require('@jest/globals');
        describe("suite", () => { 
          test("foo"); 
          expect(true).toBeDefined();
        })
    `,
      parserOptions: { sourceType: 'module' },
      errors: [
        { endColumn: 3, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        const { pending } = require('actions');
        describe('foo', () => {
          test.each(['hello', 'world'])("%s", (a) => {});
        });
      `,
      output: dedent`
        const { describe, test } = require('@jest/globals');
        const { pending } = require('actions');
        describe('foo', () => {
          test.each(['hello', 'world'])("%s", (a) => {});
        });
    `,
      parserOptions: { sourceType: 'module' },
      errors: [
        { endColumn: 4, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
  ],
});
