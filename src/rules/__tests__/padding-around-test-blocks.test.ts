/**
 * @fileoverview Enforces padding line around test/it blocks
 * @author Dan Green-Leipciger
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import { RuleTester } from 'eslint';
import rule from '../padding-around-test-blocks';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const valid = `
const foo = 'bar';
const bar = 'baz';

it('foo', () => {
  // stuff
});

fit('bar', () => {
  // stuff
});

test('foo foo', () => {});

test('bar bar', () => {});

// Nesting
describe('other bar', () => {
  const thing = 123;

  test('is another bar w/ test', () => {
  });

  // With a comment
  it('is another bar w/ it', () => {
  });

  test.skip('skipping', () => {}); // Another comment

  it.skip('skipping too', () => {});
});

xtest('weird', () => {});

test
  .skip('skippy skip', () => {});

xit('bar foo', () => {});
`;

const invalid = `
const foo = 'bar';
const bar = 'baz';
it('foo', () => {
  // stuff
});
fit('bar', () => {
  // stuff
});
test('foo foo', () => {});
test('bar bar', () => {});

// Nesting
describe('other bar', () => {
  const thing = 123;
  test('is another bar w/ test', () => {
  });
  // With a comment
  it('is another bar w/ it', () => {
  });
  test.skip('skipping', () => {}); // Another comment
  it.skip('skipping too', () => {});
});xtest('weird', () => {});
test
  .skip('skippy skip', () => {});
xit('bar foo', () => {});
`;

ruleTester.run('padding-around-test-blocks', rule, {
  valid: [valid],
  invalid: [
    {
      filename: 'src/component.test.jsx',
      code: invalid,
      output: valid,
      errors: 11,
    },
    {
      filename: 'src/component.test.js',
      code: invalid,
      output: valid,
      errors: [
        {
          messageId: 'missingPadding',
          line: 4,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 7,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 10,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 11,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 16,
          column: 3,
        },
        {
          messageId: 'missingPadding',
          line: 19,
          column: 3,
        },
        {
          messageId: 'missingPadding',
          line: 21,
          column: 3,
        },
        {
          messageId: 'missingPadding',
          line: 22,
          column: 3,
        },
        {
          messageId: 'missingPadding',
          line: 23,
          column: 4,
        },
        {
          messageId: 'missingPadding',
          line: 24,
          column: 1,
        },
        {
          messageId: 'missingPadding',
          line: 26,
          column: 1,
        },
      ],
    },
  ],
});