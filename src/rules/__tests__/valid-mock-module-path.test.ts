import dedent from 'dedent';
import rule from '../valid-mock-module-path';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('valid-mock-module-path', rule, {
  valid: [
    { filename: __filename, code: 'jest.mock("./fixtures/module")' },
    { filename: __filename, code: 'jest.mock("./fixtures/module", () => {})' },
    { filename: __filename, code: 'jest.mock()' },
    {
      filename: __filename,
      code: 'jest.doMock("./fixtures/module", () => {})',
    },
    {
      filename: __filename,
      code: dedent`
        describe("foo", () => {});
      `,
    },
    { filename: __filename, code: 'jest.doMock("./fixtures/module")' },
    { filename: __filename, code: 'jest.mock("./fixtures/module/foo.ts")' },
    { filename: __filename, code: 'jest.doMock("./fixtures/module/foo.ts")' },
    { filename: __filename, code: 'jest.mock("./fixtures/module/foo.js")' },
    { filename: __filename, code: 'jest.doMock("./fixtures/module/foo.js")' },
    'jest.mock("eslint")',
    'jest.doMock("eslint")',
    'jest.mock("child_process")',
    'jest.mock(() => {})',
    {
      filename: __filename,
      code: dedent`
        const a = "../module/does/not/exist";
        jest.mock(a);
    `,
    },
    { filename: __filename, code: 'jest.mock("./fixtures/module/jsx/foo")' },
    { filename: __filename, code: 'jest.mock("./fixtures/module/tsx/foo")' },
    {
      filename: __filename,
      code: 'jest.mock("./fixtures/module/tsx/foo")',
      options: [{ moduleFileExtensions: ['.jsx'] }],
    },
    {
      filename: __filename,
      code: 'jest.mock("./fixtures/module/bar")',
      options: [{ moduleFileExtensions: ['.json'] }],
    },
    {
      filename: __filename,
      code: 'jest.mock("./fixtures/module/bar")',
      options: [{ moduleFileExtensions: ['.css'] }],
    },
  ],
  invalid: [
    {
      filename: __filename,
      code: "jest.mock('../module/does/not/exist')",
      errors: [
        {
          messageId: 'invalidMockModulePath',
          data: { moduleName: "'../module/does/not/exist'" },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      filename: __filename,
      code: 'jest.mock("../file/does/not/exist.ts")',
      errors: [
        {
          messageId: 'invalidMockModulePath',
          data: { moduleName: '"../file/does/not/exist.ts"' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      filename: __filename,
      code: 'jest.mock("./fixtures/module/foo.jsx")',
      options: [{ moduleFileExtensions: ['.tsx'] }],
      errors: [
        {
          messageId: 'invalidMockModulePath',
          data: { moduleName: '"./fixtures/module/foo.jsx"' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      filename: __filename,
      code: 'jest.mock("./fixtures/module/foo.jsx")',
      options: [{ moduleFileExtensions: undefined }],
      errors: [
        {
          messageId: 'invalidMockModulePath',
          data: { moduleName: '"./fixtures/module/foo.jsx"' },
          column: 1,
          line: 1,
        },
      ],
    },
    {
      filename: __filename,
      code: 'jest.mock("@doesnotexist/module")',
      errors: [
        {
          messageId: 'invalidMockModulePath',
          data: { moduleName: '"@doesnotexist/module"' },
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});
