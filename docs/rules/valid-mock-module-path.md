# jest/valid-mock-module-path

📝 Disallow mocking of non-existing module paths.

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

// Local file that cannot be found and is NOT virtual
jest.mock('../../this/path/does/not/exist.js', undefined, { virtual: false });
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

// Module(s) that cannot be found but are configured as virtual
jest.mock('@org/some-module-not-in-package-json', undefined, { virtual: true });
jest.mock('some-module-not-in-package-json', undefined, { virtual: true });

// Local file that cannot be found but is configured as virtual
jest.mock('../../this/path/does/not/exist.js', undefined, { virtual: true });
```

## Options

```json
{
  "jest/valid-mock-module-path": [
    "error",
    {
      "moduleFileExtensions": [".js", ".ts", ".jsx", ".tsx", ".json"]
    }
  ]
}
```

### `moduleFileExtensions`

This array option controls which file extensions the plugin checks for
existence. The default extensions are:

- `".js"`
- `".ts"`
- `".jsx"`
- `".tsx"`
- `".json"`

For any custom extension, a preceding dot **must** be present before the file
extension for desired effect.

## When Not To Use It

Don't use this rule on non-jest test files.
