# Suggest using `toStrictEqual()` (`prefer-strict-equal`)

💼 This rule is enabled in the following
[configs](https://github.com/jest-community/eslint-plugin-jest/blob/main/README.md#shareable-configurations):
`all`.

💡 This rule provides
[suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions)
that can be applied manually.

<!-- end rule header -->

`toStrictEqual` not only checks that two objects contain the same data but also
that they have the same structure. It is common to expect objects to not only
have identical values but also to have identical keys. A stricter equality will
catch cases where two objects do not have identical keys.

## Rule details

This rule triggers a warning if `toEqual()` is used to assert equality.

### Default configuration

The following pattern is considered warning:

```js
expect({ a: 'a', b: undefined }).toEqual({ a: 'a' }); // true
```

The following pattern is not warning:

```js
expect({ a: 'a', b: undefined }).toStrictEqual({ a: 'a' }); // false
```
