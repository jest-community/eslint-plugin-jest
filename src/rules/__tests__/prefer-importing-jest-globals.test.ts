import dedent from 'dedent';
import rule from '../prefer-importing-jest-globals';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'script',
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
        test('should pass', () => {
            expect(true).toBeDefined();
        });
      `,
      options: [{ types: ['jest'] }],
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        const { it } = require('@jest/globals');
        it('should pass', () => {
            expect(true).toBeDefined();
        });
      `,
      options: [{ types: ['test'] }],
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
        const { test, expect } = require(\`@jest/globals\`);
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
        import describe from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        import { describe, expect, test } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 7,
          column: 3,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        jest.useFakeTimers();
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        import { jest } from '@jest/globals';
        jest.useFakeTimers();
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      options: [{ types: ['jest'] }],
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 5,
          column: 1,
          line: 1,
          messageId: 'preferImportingJestGlobal',
        },
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
        import { describe, expect, test } from '@jest/globals';
        import { xit } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 6,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        console.log('hello');
        import * as fs from 'fs';
        const { test, 'describe': describe } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        console.log('hello');
        import * as fs from 'fs';
        import { describe, expect, test } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 9,
          column: 3,
          line: 6,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        console.log('hello');
        import jestGlobals from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        console.log('hello');
        import { describe, expect, jestGlobals, test } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        import { pending } from 'actions';
        describe('foo', () => {
          test.each(['hello', 'world'])("%s", (a) => {});
        });
      `,
      output: dedent`
        import { describe, test } from '@jest/globals';
        import { pending } from 'actions';
        describe('foo', () => {
          test.each(['hello', 'world'])("%s", (a) => {});
        });
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        const {describe} = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 7,
          column: 3,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        const {describe} = require(\`@jest/globals\`);
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      // todo: we should really maintain the template literals
      output: dedent`
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 7,
          column: 3,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        const source = 'globals';
        const {describe} = require(\`@jest/\${source}\`);
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        const { expect, test } = require('@jest/globals');
        const source = 'globals';
        const {describe} = require(\`@jest/\${source}\`);
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 7,
          column: 3,
          line: 4,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        const { [() => {}]: it } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
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
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 9,
          column: 3,
          line: 6,
          messageId: 'preferImportingJestGlobal',
        },
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
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
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
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
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
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 1,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
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
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
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
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
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
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        \`use strict\`;
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        \`use strict\`;
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      errors: [
        {
          endColumn: 9,
          column: 1,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        console.log('hello');
        const onClick = jest.fn();
        describe("suite", () => {
          test("foo");
          expect(onClick).toHaveBeenCalled();
        })
      `,
      output: dedent`
        const { describe, expect, jest, test } = require('@jest/globals');
        console.log('hello');
        const onClick = jest.fn();
        describe("suite", () => {
          test("foo");
          expect(onClick).toHaveBeenCalled();
        })
      `,
      errors: [
        {
          endColumn: 21,
          column: 17,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        console.log('hello');
        const onClick = jest.fn();
        describe("suite", () => {
          test("foo");
          expect(onClick).toHaveBeenCalled();
        })
      `,
      output: dedent`
        import { describe, expect, jest, test } from '@jest/globals';
        console.log('hello');
        const onClick = jest.fn();
        describe("suite", () => {
          test("foo");
          expect(onClick).toHaveBeenCalled();
        })
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 21,
          column: 17,
          line: 2,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
  ],
});

new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
}).run('prefer-importing-jest-globals: typescript edition', rule, {
  valid: [],
  invalid: [
    {
      code: dedent`
        import describe from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        import { describe, expect, test } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 7,
          column: 3,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        const {describe} = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          endColumn: 7,
          column: 3,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
  ],
});
