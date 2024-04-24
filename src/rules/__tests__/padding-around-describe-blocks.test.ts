/**
 * @fileoverview Enforces padding line around describe blocks
 * @author Dan Green-Leipciger
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule from '../padding-around-describe-blocks';
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

const valid = `
foo();
bar();

const someText = 'abc';
const someObject = {
  one: 1,
  two: 2,
};

// A comment before describe
describe('someText', () => {
  describe('some condition', () => {
  });

  describe('some other condition', () => {
  });
});

xdescribe('someObject', () => {
  // Another comment
  describe('some condition', () => {
    const anotherThing = 500;

    describe('yet another condition', () => { // A comment over here!
    });
  });
});

fdescribe('weird', () => {});

describe.skip('skip me', () => {});

const BOOP = "boop";

describe
  .skip('skip me too', () => {
    // stuff
  });
`;

const invalid = `
foo();
bar();

const someText = 'abc';
const someObject = {
  one: 1,
  two: 2,
};
// A comment before describe
describe('someText', () => {
  describe('some condition', () => {
  });
  describe('some other condition', () => {
  });
});
xdescribe('someObject', () => {
  // Another comment
  describe('some condition', () => {
    const anotherThing = 500;
    describe('yet another condition', () => { // A comment over here!
    });
  });
});fdescribe('weird', () => {});
describe.skip('skip me', () => {});
const BOOP = "boop";
describe
  .skip('skip me too', () => {
    // stuff
  });
`;

ruleTester.run('padding-around-describe-blocks', rule, {
  valid: [valid],
  invalid: [
    {
      filename: 'src/component.test.jsx',
      code: invalid,
      output: valid,
      errors: [
        {
          messageId: 'missingPadding',
          line: 11,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 14,
          column: 3,
        },
        {
          messageId: 'missingPadding',
          line: 17,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 21,
          column: 5,
        },
        {
          messageId: 'missingPadding',
          line: 24,
          column: 4,
        },
        {
          messageId: 'missingPadding',
          line: 25,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 26,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 27,
          column: 1,
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
          line: 11,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 14,
          column: 3,
        },
        {
          messageId: 'missingPadding',
          line: 17,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 21,
          column: 5,
        },
        {
          messageId: 'missingPadding',
          line: 24,
          column: 4,
        },
        {
          messageId: 'missingPadding',
          line: 25,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 26,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 27,
          column: 1,
        },
      ],
    },
  ],
});
