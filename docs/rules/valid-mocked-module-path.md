# Disallow mocking of non-existing module path (`valid-mocked-module-path`)

<!-- end auto-generated rule header -->

This rule raises an error when using `jest.mock` and `jest.doMock` and the first
argument for mocked object (module/local file) do not exist.

## Rule details

This rule checks existence of the supplied path for `jest.mock` or `jest.doMock`
in the first argument.

The following patterns are considered errors:

```js
// Module(s) that cannot be found
jest.mock('@org/some-module-not-in-package-json');
jest.mock('some-module-not-in-package-json');

// Local module (directory) that cannot be found
jest.mock('../../this/module/does/not/exist');

// Local file that cannot be found
jest.mock('../../this/path/does/not/exist.js');
```

The following patterns are **not** considered errors:

```js
// Module(s) that can be found
jest.mock('@org/some-module-in-package-json');
jest.mock('some-module-in-package-json');

// Local module that cannot be found
jest.mock('../../this/module/really/does/exist');

// Local file that cannot be found
jest.mock('../../this/path/really/does/exist.js');
```

## When Not To Use It

Don't use this rule on non-jest test files.
