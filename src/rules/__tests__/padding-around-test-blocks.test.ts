import type { TSESLint } from '@typescript-eslint/utils';
import rule from '../padding-around-test-blocks';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 6,
  },
});

const testCase = {
  code: `
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
`,
  output: `
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
`,
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
} satisfies TSESLint.InvalidTestCase<'missingPadding', never>;

ruleTester.run('padding-around-test-blocks', rule, {
  valid: [testCase.output],
  invalid: ['src/component.test.jsx', 'src/component.test.js'].map(
    filename => ({ ...testCase, filename }),
  ),
});
