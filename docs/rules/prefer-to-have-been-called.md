# Suggest using `toHaveBeenCalled` (`prefer-to-have-been-called`)

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

In order to have a better failure message, `toHaveBeenCalled` should be used
instead of checking the number of times a mock has been called.

## Rule details

This rule triggers a warning if `toHaveBeenCalledTimes` is used to assert that a
mock has or has not been called zero times

> [!NOTE]
>
> This rule should ideally be paired with
> [`prefer-to-have-been-called-times`](./prefer-to-have-been-called-times.md)

The following patterns are considered warnings:

```js
expect(someFunction).toHaveBeenCalledTimes(0);
expect(someFunction).not.toHaveBeenCalledTimes(0);
```

The following patterns are not warnings:

```js
expect(someFunction).not.toHaveBeenCalled();
expect(someFunction).toHaveBeenCalled();
```
