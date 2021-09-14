# Disallow use of deprecated functions (`no-deprecated-functions`)

Over the years Jest has accrued some debt in the form of functions that have
either been renamed for clarity, or replaced with more powerful APIs.

While typically these deprecated functions are kept in the codebase for a number
of majors, eventually they are removed completely.

## Jest version

This rule requires configuration to tell it which version of Jest is running.
You provide this through `eslint`'s
["shared settings"](https://eslint.org/docs/user-guide/configuring/configuration-files#adding-shared-settings).

Example:

```json
{
  "settings": {
    "jest": {
      "version": 27
    }
  }
}
```

To avoid hard-coding a number, you can also fetch it from the installed version
of Jest if you use a JavaScript config file such as `.eslintrc.js`:

```js
module.exports = {
  settings: {
    jest: {
      version: require('jest/package.json').version,
    },
  },
};
```

## Rule details

This rule warns about calls to deprecated functions, and provides details on
what to replace them with, based on the version of Jest that is installed.

This rule can also autofix a number of these deprecations for you.

### `jest.resetModuleRegistry`

This function was renamed to `resetModules` in Jest 15, and is scheduled for
removal in Jest 27.

### `jest.addMatchers`

This function was replaced with `expect.extend` in Jest 17, and is scheduled for
removal in Jest 27.

### `require.requireActual` & `require.requireMock`

These functions were replaced in Jest 21 and removed in Jest 26.

Originally, the `requireActual` & `requireMock` the `requireActual`&
`requireMock` functions were placed onto the `require` function.

These functions were later moved onto the `jest` object in order to be easier
for type checkers to handle, and their use via `require` deprecated. Finally,
the release of Jest 26 saw them removed from the `require` function all
together.

### `jest.runTimersToTime`

This function was renamed to `advanceTimersByTime` in Jest 22, and is scheduled
for removal in Jest 27.

### `jest.genMockFromModule`

This function was renamed to `createMockFromModule` in Jest 26, and is scheduled
for removal in a future version of Jest.
