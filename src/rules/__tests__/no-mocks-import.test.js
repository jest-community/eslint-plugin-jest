'use strict';

const rule = require('../no-mocks-import.js');
const { RuleTester } = require('eslint');
const ruleTester = new RuleTester();

ruleTester.run('no-mocks-import', rule, {
  valid: [
    {
      code: 'import something from "something"',
      parserOptions: { sourceType: 'module' },
    },
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
    {
      code: 'import thing from "./__mocks__/index"',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 38, column: 1, messageId: 'noManualImport' }],
    },
  ],
});
