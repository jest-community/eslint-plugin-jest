# Disallow using confusing setTimeout in test (`no-confusing-set-timeout`)

<!-- end auto-generated rule header -->

`jest.setTimeout` can be called multiple times anywhere within a single test
file. However, only the last call will have an effect, and it will actually be
invoked before any other jest functions.

## Rule details

This rule describes some tricky ways about `jest.setTimeout` that should not
recommend in Jest:

- should set `jest.setTimeout` in any testsuite methods before(such as
  `describe`, `test` or `it`);
- should set `jest.setTimeout` in global scope.
- should only call `jest.setTimeout` once in a single test file;

Examples of **incorrect** code for this rule:

```js
describe('test foo', () => {
  jest.setTimeout(1000);
  it('test-description', () => {
    // test logic;
  });
});

describe('test bar', () => {
  it('test-description', () => {
    jest.setTimeout(1000);
    // test logic;
  });
});

test('foo-bar', () => {
  jest.setTimeout(1000);
});

describe('unit test', () => {
  beforeEach(() => {
    jest.setTimeout(1000);
  });
});
```

Examples of **correct** code for this rule:

```js
jest.setTimeout(500);
test('test test', () => {
  // do some stuff
});
```

```js
jest.setTimeout(1000);
describe('test bar bar', () => {
  it('test-description', () => {
    // test logic;
  });
});
```
