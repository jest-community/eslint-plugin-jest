# Enforce assertion to be made in a test body (expect-expect)

Ensure that there is at least one `expect` call made in a test.

## Rule details

This rule triggers when there is no call made to `expect` in a test, to prevent
users from forgetting to add assertions.

### Default configuration

The following patterns are considered warnings:

```js
it('should be a test', () => {
  console.log('no assertion');
});
test('should assert something', () => {});
```

The following patterns are not warnings:

```js
it('should be a test', () => {
  expect(true).toBeDefined();
});
it('should work with callbacks/async', () => {
  somePromise().then(res => expect(res).toBe('passed'));
});
```
