# Warns on usage of deprecated functions (no-deprecated-functions)

Over the years jest has accrued some debt in the form of functions that have
either been renamed for clarity, or replaced with more powerful APIs.

While typically these deprecated functions are kept in the codebase for a number
of majors, eventually they are removed completely.

## Rule details

This rule warns about calls to deprecated functions, and provides details on
what to replace them with.

This rule can also autofix a number of these deprecations for you.

### `require.requireActual.` & `require.requireMock`

These functions were removed in Jest 26.

Originally in the early days of jest, the `requireActual`& `requireMock`
functions were placed onto the `require` function.

These functions were later moved onto the `jest` global, and their use via
`require` deprecated. Finally, the release of Jest 26 saw them removed from the
`require` function all together.

The PR implementing the removal can be found
[here](https://github.com/facebook/jest/pull/9854).

### `jest.addMatchers`

This function has been replaced with `expect.extend`, and will ideally be
removed in Jest 27.

### `jest.resetModuleRegistry`

This function has been renamed to `resetModules`, and will ideally be removed in
Jest 27.

### `jest.runTimersToTime`

This function has been renamed to `advanceTimersByTime`, and will ideally be
removed in Jest 27.
