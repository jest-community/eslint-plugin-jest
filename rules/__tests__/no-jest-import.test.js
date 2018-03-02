'use strict';

const rule = require('../no-jest-import.js');
const RuleTester = require('eslint').RuleTester;
const ruleTester = new RuleTester();

ruleTester.run('no-jest-import', rule, {
  valid: [
    {
      code: 'import something from "something"',
      parserOptions: { sourceType: 'module' },
    },
    'require("somethingElse")',
    'entirelyDifferent(fn)',
  ],
  invalid: [
    {
      code: 'require("jest")',
      errors: [
        {
          endColumn: 15,
          column: 9,
          message: `Jest is automatically in scope. Do not import Jest, as it doesn't export anything.`,
        },
      ],
    },
    {
      code: 'import jest from "jest"',
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 24,
          column: 1,
          message: `Jest is automatically in scope. Do not import Jest, as it doesn't export anything.`,
        },
      ],
    },
    {
      code: 'var jest = require("jest")',
      errors: [
        {
          endColumn: 26,
          column: 20,
          message: `Jest is automatically in scope. Do not import Jest, as it doesn't export anything.`,
        },
      ],
    },
    {
      code: 'import {jest as test} from "jest"',
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 34,
          column: 1,
          message: `Jest is automatically in scope. Do not import Jest, as it doesn't export anything.`,
        },
      ],
    },
    {
      code: 'const jest = require("jest")',
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 28,
          column: 22,
          message: `Jest is automatically in scope. Do not import Jest, as it doesn't export anything.`,
        },
      ],
    },
  ],
});
