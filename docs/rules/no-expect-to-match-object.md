# Avoid using `expect().toMatchObject()` (no-expect-to-match-object)

Jest allows you to to check that a JavaScript object matches a **subset** of the
properties of an object using `expect().toMatchObject(object)`. Checking just a
subset of an object might lead to not catching changes in an object in the
tests, this rule bans `expect().toMatchObject` in favor of
`expect().toStrictEqual` for a **deep** equality check or
`expect().objectContaining` to consciously check the properties that are
interesting.

## Rule details

This rule triggers a warning if `expect().toMatchObject` is used.

This rule is disabled by default.

### Default configuration

The following patterns is considered warning:

```js
test('some test', () => {
  expect({ a: 1, b: 2 }).toMatchObject({ a: 1, b: 2 });
});
```

The following patterns are not considered warning:

```js
test('some test', () => {
  expect({ a: 1, b: 2 }).toStrictEqual({ a: 1, b: 2 });
});

test('some test', () => {
  expect({ a: 1, b: 2 }).objectContaining({
    a: expect.any(Number),
    b: expect.any(Number),
  });
});
```
