# Enforce valid `expect()` usage (valid-expect)

Ensure `expect()` is called with a single argument and there is an actual
expectation made.

## Rule details

This rule triggers a warning if `expect()` is called with more than one argument
or without arguments. It would also issue a warning if there is nothing called
on `expect()`, e.g.:

```js
expect();
expect('something');
```

or when a matcher function was not called, e.g.:

```js
expect(true).toBeDefined;
```

This rule is enabled by default.

### Default configuration

The following patterns are considered warnings:

```js
expect();
expect().toEqual('something');
expect('something', 'else');
expect('something');
expect(true).toBeDefined;
expect(Promise.resolve('hello')).resolves;

// 👎 expect(Promise).resolves is not returned
test('foo', () => {
  expect(Promise.resolve('hello')).resolves.toBeDefined();
});
// 👎 expect(Promise).resolves is not awaited
test('foo', async () => {
  expect(Promise.resolve('hello')).resolves.toBeDefined();
});
// 👎 expect(awaited Promise) should not use .resolves or .rejects property
test('foo', async () => {
  expect(await Promise.resolve('hello')).resolves.toBeDefined();
});
```

The following patterns are not warnings:

```js
expect('something').toEqual('something');
expect([1, 2, 3]).toEqual([1, 2, 3]);
expect(true).toBeDefined();
expect(Promise.resolve('hello')).resolves.toEqual('hello');

// 👍 expect(Promise).resolves is returned
test('foo', () => {
  return expect(Promise.resolve('hello')).resolves.toBeDefined();
});
// 👍 expect(Promise).resolves is awaited
test('foo', async () => {
  await expect(Promise.resolve('hello')).resolves.toBeDefined();
});
// 👍 expect(Promise).rejects is implicitly returned
test('foo', () => expect(Promise.reject('hello')).rejects.toBeDefined());
// 👍 expect(awaited Promise) is not used with .resolves
test('foo', async () => {
  expect(await Promise.resolve('hello')).toBeDefined();
});
// 👍 expect(awaited Promise) is not used with .rejects
test('foo', async () => {
  expect(await Promise.reject('hello')).toBeDefined();
});
```
