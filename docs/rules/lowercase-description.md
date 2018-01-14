# Enforce lowercase descriptions in it() (lowercase-description)

## Rule details

Enforce `it()` tests to have descriptions that begin with a lowercase letter.
This provides more readable test failures. This rule is not enabled by default.

The following pattern is considered a warning:

```js
it('Adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

The following pattern is not considered a warning:

```js
it('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```
