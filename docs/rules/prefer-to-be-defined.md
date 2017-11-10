# Suggest using `toBeDefined()` / `toBeUndefined()` (prefer-to-be-defined)

In order to have a better failure message, `toBeDefined()` or `toBeUndefined()`
should be used upon asserting expections on defined or undefined value.

## Rule details

This rule triggers a warning if `not.toBe()` is used to assert a undefined value
or `toBe()` is used to assert a undefined value.

```js
expect(true).not.toBe(undefined);
expect(undefined).toBe(undefined);
```

This rule is enabled by default.

### Default configuration

The following patterns are considered warning:

```js
expect(true).not.toBeUndefined();
expect(undefined).toBe(undefined);
```

The following patterns are not warning:

```js
expect(true).toBeDefined();
expect(undefined).toBeUndefined();
```
