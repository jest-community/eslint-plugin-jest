# Disallow disabling coverage for whole files (no-istanbul-ignore-file)

This rule raises a warning about "istanbul ignore" comments missing a reason why
code is ignored.

## Rule Details

The rule finds all comments matching the pattern `istanbul ignore <word>` and
raises a warning if it is missing a reason afterwards.

The following patterns are considered warnings:

```js
/* istanbul ignore file */

// istanbul ignore file
```

These patterns would not be considered warnings:

```js
/* istanbul ignore next: covered in e2e */

/* istanbul ignore if: lazy to tests */

// istanbul ignore else: will cover later
```
