/**
 * @fileoverview Enforces single line padding around afterEach blocks
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule from '../padding-around-after-each-blocks';
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
afterEach(() => {
});
describe('someText', () => {
  const something = 'abc';
  // A comment
  afterEach(() => {
    // stuff
  });
  afterEach(() => {
    // other stuff
  });
});
describe('someText', () => {
  const something = 'abc';
  afterEach(() => {
    // stuff
  });
});
`;

const valid = `
const someText = 'abc';

afterEach(() => {
});

describe('someText', () => {
  const something = 'abc';

  // A comment
  afterEach(() => {
    // stuff
  });

  afterEach(() => {
    // other stuff
  });
});
describe('someText', () => {
  const something = 'abc';

  afterEach(() => {
    // stuff
  });
});
`;

ruleTester.run('padding-around-after-each-blocks', rule, {
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
          line: 17,
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
          line: 17,
          column: 3,
        },
      ],
    },
  ],
});
