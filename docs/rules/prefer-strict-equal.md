# Suggest using `toStrictEqual()` ` (prefer-strict-equal)

`toStrictEqual` not only checks that two objects contain the same data but also
that they have the same shape. The believe is that imposing a stricter equality
results in safer tests.

## Rule details

This rule triggers a warning if `toEqual()` is used to assert equality.

This rule is enabled by default.

### Default configuration

The following pattern is considered warning:

```js
expect({ a: 'a', b: undefined }).toEqual({ a: 'a' }); // true
```

The following pattern is not warning:

```js
expect({ a: 'a', b: undefined }).toStrictEqual({ a: 'a' }); // false
```
