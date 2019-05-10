# Enforce valid `describe()` callback (valid-describe)

Using an improper `describe()` callback function can lead to unexpected test
errors.

## Rule Details

This rule validates the signature of `describe()` functions. It validates two
things:

#### 1. The first argument is a string literal

NOTE: if you are using a dynamic value, disable the rule inline like so:

```js
// eslint-disable-next-line jest/valid-describe
describe(myTestName, () => {
```

See
[this comment](https://github.com/jest-community/eslint-plugin-jest/pull/253#issuecomment-491371038)
for reasoning behind not supporting dynamic values.

#### 2. The second argument is a callback function

This callback function:

- should not be
  [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- should not contain any parameters
- should not contain any `return` statements

The following `describe` function aliases are also validated:

- `describe`
- `describe.only`
- `describe.skip`
- `fdescribe`
- `xdescribe`

The following patterns are considered warnings:

```js
// Async callback functions are not allowed
describe('myFunction()', async () => {
  // ...
});

// Callback function parameters are not allowed
describe('myFunction()', done => {
  // ...
});

//
describe('myFunction', () => {
  // No return statements are allowed in block of a callback function
  return Promise.resolve().then(() => {
    it('breaks', () => {
      throw new Error('Fail');
    });
  });
});
```

The following patterns are not considered warnings:

```js
describe('myFunction()', () => {
  it('returns a truthy value', () => {
    expect(myFunction()).toBeTruthy();
  });
});
```
