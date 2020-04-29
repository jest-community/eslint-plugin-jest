# Disallow disabling coverage for whole files (no-istanbul-ignore-file)

This rule raises a warning about "istanbul ignore file" comments.

## Rule Details

The rule finds all comments starting with `istanbul ignore file` and raises a
warning.

The following patterns are considered warnings:

```js
/* istanbul ignore file */

/* istanbul ignore file: lazy to write tests */

// istanbul ignore file

// istanbul ignore file: lazy to write tests
```

These patterns would not be considered warnings:

```js
/* istanbul ignore next */

/* istanbul ignore if: lazy to write tests */

// istanbul ignore else
```
