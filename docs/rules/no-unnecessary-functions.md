# Disallow use of globally enabled functions (`no-unnecessary-functions`)

Jest allows you to globally call functions before each test is run, so calling
them in your tests is unnecessary.

## Rule details

This rule triggers when one of the specified functions is used. It is intended
to prevent calls to functions which are added by jest options, for example when
`"clearMocks": true` is set in your config calling `jest.clearAllMocks()` is
unnecessary.

Examples of **incorrect** code for this rule:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["clearAllMocks"] }] */
beforeEach(() => {
  jest.clearAllMocks();
});
```

Examples of **correct** code for this rule:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["clearAllMocks"] }] */
beforeEach(() => {});
```

## Options

```json
{
  "jest/no-unnecessary-functions": [
    "error",
    {
      "reportFunctionNames": ["clearAllMocks"]
    }
  ]
}
```

### `reportFunctionNames`

This array option specifies the names of functions that are unnecessary. The
array can include one or more of the following: `resetModules`, `clearAllMocks`,
`resetAllMocks`, `restoreAllMocks`.

Examples of **incorrect** code for the
`{ "assertFunctionNames": ["resetModules"] }` option:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["resetModules"] }] */
beforeEach(() => {
  jest.resetModules();
});
```

Examples of **correct** code for the
`{ "reportFunctionNames": ["resetModules"] }` option:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["resetModules"] }] */
beforeEach(() => {});
```

Examples of **incorrect** code for the
`{ "assertFunctionNames": ["clearAllMocks"] }` option:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["clearAllMocks"] }] */
beforeEach(() => {
  jest.clearAllMocks();
});
```

Examples of **correct** code for the
`{ "reportFunctionNames": ["clearAllMocks"] }` option:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["clearAllMocks"] }] */
beforeEach(() => {});
```

Examples of **incorrect** code for the
`{ "assertFunctionNames": ["resetAllMocks"] }` option:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["resetAllMocks"] }] */
beforeEach(() => {
  jest.resetAllMocks();
});
```

Examples of **correct** code for the
`{ "reportFunctionNames": ["resetAllMocks"] }` option:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["resetAllMocks"] }] */
beforeEach(() => {});
```

Examples of **incorrect** code for the
`{ "assertFunctionNames": ["restoreAllMocks"] }` option:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["restoreAllMocks"] }] */
beforeEach(() => {
  jest.restoreAllMocks();
});
```

Examples of **correct** code for the
`{ "reportFunctionNames": ["restoreAllMocks"] }` option:

```js
/* eslint jest/no-unnecessary-functions ["error", { "reportFunctionNames": ["restoreAllMocks"] }] */
beforeEach(() => {});
```
