# Disallow duplicate setup and teardown hooks (`no-duplicate-hooks`)

💼 This rule is enabled in the following
[configs](https://github.com/jest-community/eslint-plugin-jest/blob/main/README.md#shareable-configurations):
`all`.

<!-- end rule header -->

A `describe` block should not contain duplicate hooks.

## Rule details

Examples of **incorrect** code for this rule

```js
/* eslint jest/no-duplicate-hooks: "error" */

describe('foo', () => {
  beforeEach(() => {
    // some setup
  });
  beforeEach(() => {
    // some setup
  });
  test('foo_test', () => {
    // some test
  });
});

// Nested describe scenario
describe('foo', () => {
  beforeEach(() => {
    // some setup
  });
  test('foo_test', () => {
    // some test
  });
  describe('bar', () => {
    test('bar_test', () => {
      afterAll(() => {
        // some teardown
      });
      afterAll(() => {
        // some teardown
      });
    });
  });
});
```

Examples of **correct** code for this rule

```js
/* eslint jest/no-duplicate-hooks: "error" */

describe('foo', () => {
  beforeEach(() => {
    // some setup
  });
  test('foo_test', () => {
    // some test
  });
});

// Nested describe scenario
describe('foo', () => {
  beforeEach(() => {
    // some setup
  });
  test('foo_test', () => {
    // some test
  });
  describe('bar', () => {
    test('bar_test', () => {
      beforeEach(() => {
        // some setup
      });
    });
  });
});
```
