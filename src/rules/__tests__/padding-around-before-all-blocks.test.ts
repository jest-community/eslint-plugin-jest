/**
 * @fileoverview Enforces single line padding around beforeAll blocks
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { RuleTester } from 'eslint';
import rule from '../padding-around-before-all-blocks';

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
beforeAll(() => {
});
describe('someText', () => {
  const something = 'abc';
  // A comment
  beforeAll(() => {
    // stuff
  });
  beforeAll(() => {
    // other stuff
  });
});

describe('someText', () => {
  const something = 'abc';
  beforeAll(() => {
    // stuff
  });
});
`;

const valid = `
const someText = 'abc';

beforeAll(() => {
});

describe('someText', () => {
  const something = 'abc';

  // A comment
  beforeAll(() => {
    // stuff
  });

  beforeAll(() => {
    // other stuff
  });
});

describe('someText', () => {
  const something = 'abc';

  beforeAll(() => {
    // stuff
  });
});
`;

ruleTester.run('padding-around-before-all-blocks', rule, {
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
          messageId: 'missingPadding',
          line: 3,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 5,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 8,
          column: 3,
        },
        {
          messageId: 'missingPadding',
          line: 11,
          column: 3,
        },
        {
          messageId: 'missingPadding',
          line: 18,
          column: 3,
        },
      ],
    },
  ],
});