/**
 * @fileoverview Enforces single line padding before afterAll blocks
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule from '../padding-around-after-all-blocks';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
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
