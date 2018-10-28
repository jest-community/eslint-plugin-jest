# Suggest using `jest.spyOn()` (prefer-spy-on)

When mocking a function by overwriting a property you have to manually restore
the original implementation when cleaning up. When using `jest.spyOn()` Jest
keeps track of changes, and they can be restored with `jest.restoreAllMocks()`,
`mockFn.mockRestore()` or by setting `restoreMocks` to true in the Jest config.

## Rule details

This rule triggers a warning if an object's property is overwritten with a jest
mock.

### Default configuration

The following pattern is considered warning:

```js
Date.now = jest.fn();
```

The following pattern is not warning:

```js
jest.spyOn(Date, 'now');
```
