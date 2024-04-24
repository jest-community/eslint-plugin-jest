/**
 * @fileoverview Enforces single line padding before afterAll blocks
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../padding').rules['padding-around-after-all-blocks'];

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const invalid = `
const someText = 'abc';
afterAll(() => {
});
describe('someText', () => {
  const something = 'abc';
  // A comment
  afterAll(() => {
    // stuff
  });
  afterAll(() => {
    // other stuff
  });
});

describe('someText', () => {
  const something = 'abc';
  afterAll(() => {
    // stuff
  });
});
`;

const valid = `
const someText = 'abc';

afterAll(() => {
});

describe('someText', () => {
  const something = 'abc';

  // A comment
  afterAll(() => {
    // stuff
  });

  afterAll(() => {
    // other stuff
  });
});

describe('someText', () => {
  const something = 'abc';

  afterAll(() => {
    // stuff
  });
});
`;

ruleTester.run('padding-around-after-all-blocks', rule, {
  valid: [valid],
  invalid: [
    {
      filename: 'src/component.test.jsx',
      code: invalid,
      output: valid,
      errors: 5,
    },
    {
      filename: 'src/component.test.js',
      code: invalid,
      output: valid,
      errors: [
        {
          message: 'Expected blank line before this statement.',
          line: 3,
          column: 1,
        },
        {
          message: 'Expected blank line before this statement.',
          line: 5,
          column: 1,
        },
        {
          message: 'Expected blank line before this statement.',
          line: 8,
          column: 3,
        },
        {
          message: 'Expected blank line before this statement.',
          line: 11,
          column: 3,
        },
        {
          message: 'Expected blank line before this statement.',
          line: 18,
          column: 3,
        },
      ],
    },
  ],
});
