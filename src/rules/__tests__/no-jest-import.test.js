'use strict';

const rule = require('../no-jest-import.js');
const { RuleTester } = require('eslint');
const ruleTester = new RuleTester();

ruleTester.run('no-jest-import', rule, {
  valid: [
    {
      code: 'import something from "something"',
      parserOptions: { sourceType: 'module' },
    },
    'require("somethingElse")',
    'require()',
    'entirelyDifferent(fn)',
  ],
  invalid: [
    {
      code: 'require("jest")',
      errors: [{ endColumn: 15, column: 9, messageId: 'unexpectedImport' }],
    },
    {
      code: 'import jest from "jest"',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 24, column: 1, messageId: 'unexpectedImport' }],
    },
    {
      code: 'var jest = require("jest")',
      errors: [{ endColumn: 26, column: 20, messageId: 'unexpectedImport' }],
    },
    {
      code: 'import {jest as test} from "jest"',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 34, column: 1, messageId: 'unexpectedImport' }],
    },
    {
      code: 'const jest = require("jest")',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 28, column: 22, messageId: 'unexpectedImport' }],
    },
  ],
});
