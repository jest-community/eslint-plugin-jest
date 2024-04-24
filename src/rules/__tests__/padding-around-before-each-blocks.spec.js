/**
 * @fileoverview Enforces single line padding around beforeEach blocks
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const { default: rule } = require('../padding-around-before-each-blocks');

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
beforeEach(() => {
});
describe('someText', () => {
  const something = 'abc';
  // A comment
  beforeEach(() => {
    // stuff
  });
  beforeEach(() => {
    // other stuff
  });
});

describe('someText', () => {
  const something = 'abc';
  beforeEach(() => {
    // stuff
  });
});
`;

const valid = `
const someText = 'abc';

beforeEach(() => {
});

describe('someText', () => {
  const something = 'abc';

  // A comment
  beforeEach(() => {
    // stuff
  });

  beforeEach(() => {
    // other stuff
  });
});

describe('someText', () => {
  const something = 'abc';

  beforeEach(() => {
    // stuff
  });
});
`;

ruleTester.run('padding-around-before-each-blocks', rule, {
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
