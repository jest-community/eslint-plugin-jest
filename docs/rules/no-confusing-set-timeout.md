# Disallow using confusing setTimeout in test (`no-confusing-set-timeout`)

<!-- end auto-generated rule header -->

This rule will raise a warning about confusing `jest-setTimeout` in test.

## Rule details

This rule describes some tricky ways about `jest.setTimeout` that should not
recommend in Jest:

- should set `jest.setTimeout` in any testsuite methods before(such as
  `describe`, `test` or `it`);
- should set `jest.setTimeout` in global scope.
- should only call `jest.setTimeout` once in a single test file;

Examples of **incorrect** code for this rule:

```js
describe('A', () => {
  jest.setTimeout(1000);
  it('test-description', () => {
    // test logic;
  });
});

describe('B', () => {
  it('test-description', () => {
    jest.setTimeout(1000);
    // test logic;
  });
});

test('C', () => {
  jest.setTimeout(1000);
});

describe('D', () => {
  beforeEach(() => {
    jest.setTimeout(1000);
  });
});
```

Examples of **correct** code for this rule:

```js
jest.setTimeout(500);
test('A', () => {
  // do some stuff
});
```

```js
jest.setTimeout(1000);
describe('B', () => {
  it('test-description', () => {
    // test logic;
  });
});
```
