import { TSESLint } from '@typescript-eslint/utils';
import rule from '../no-mocks-import';
import { espreeParser, flatCompat } from './test-utils';

const ruleTester = new TSESLint.RuleTester(
  flatCompat({
    parser: espreeParser,
    parserOptions: {
      ecmaVersion: 2015,
    },
  }),
);

ruleTester.run('no-mocks-import', rule, {
  valid: [
    flatCompat({
      code: 'import something from "something"',
      parserOptions: { sourceType: 'module' },
    }),
    'require("somethingElse")',
    'require("./__mocks__.js")',
    'require("./__mocks__x")',
    'require("./__mocks__x/x")',
    'require("./x__mocks__")',
    'require("./x__mocks__/x")',
    'require()',
    'var path = "./__mocks__.js"; require(path)',
    'entirelyDifferent(fn)',
  ],
  invalid: [
    {
      code: 'require("./__mocks__")',
      errors: [{ endColumn: 22, column: 9, messageId: 'noManualImport' }],
    },
    {
      code: 'require("./__mocks__/")',
      errors: [{ endColumn: 23, column: 9, messageId: 'noManualImport' }],
    },
    {
      code: 'require("./__mocks__/index")',
      errors: [{ endColumn: 28, column: 9, messageId: 'noManualImport' }],
    },
    {
      code: 'require("__mocks__")',
      errors: [{ endColumn: 20, column: 9, messageId: 'noManualImport' }],
    },
    {
      code: 'require("__mocks__/")',
      errors: [{ endColumn: 21, column: 9, messageId: 'noManualImport' }],
    },
    {
      code: 'require("__mocks__/index")',
      errors: [{ endColumn: 26, column: 9, messageId: 'noManualImport' }],
    },
    flatCompat({
      code: 'import thing from "./__mocks__/index"',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 38, column: 1, messageId: 'noManualImport' }],
    }),
  ],
});
