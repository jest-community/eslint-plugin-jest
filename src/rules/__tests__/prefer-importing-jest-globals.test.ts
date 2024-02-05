import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../prefer-importing-jest-globals';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
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
    },
    {
      code: dedent`
        const { test } = require('my-test-library');
        test("foo");
      `,
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
      parserOptions: { sourceType: 'script' },
      errors: [
        { endColumn: 9, column: 1, messageId: 'preferImportingJestGlobal' },
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
      errors: [
        { endColumn: 9, column: 1, messageId: 'preferImportingJestGlobal' },
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
      errors: [
        { endColumn: 9, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        import React from 'react';
        import { yourFunction } from './yourFile';
        import something from "something";
        import { test } from '@jest/globals';
        import { xit } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        import React from 'react';
        import { yourFunction } from './yourFile';
        import something from "something";
        import { test, describe, expect } from '@jest/globals';
        import { xit } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
    `,
      parserOptions: { sourceType: 'module' },
      errors: [
        { endColumn: 9, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        console.log('hello');
        const fs = require('fs');
        const { test, 'describe': describe } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        console.log('hello');
        const fs = require('fs');
        const { test, describe, expect } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
    `,
      errors: [
        { endColumn: 9, column: 3, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        console.log('hello');
        const jestGlobals = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        console.log('hello');
        const { describe, test, expect } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
    `,
      errors: [
        { endColumn: 9, column: 1, messageId: 'preferImportingJestGlobal' },
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
        const { pending } = require('actions');
        const { describe, test } = require('@jest/globals');
        describe('foo', () => {
          test.each(['hello', 'world'])("%s", (a) => {});
        });
    `,
      errors: [
        { endColumn: 9, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
    {
      code: dedent`
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        const { describe, test, expect } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
    `,
      errors: [
        { endColumn: 9, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
  ],
});
