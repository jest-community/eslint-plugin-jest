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
      "moduleFileExtensions": [".js", ".ts", ".jsx", ".tsx", ".json"],
      "moduleNameMapper": {}
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

### `moduleNameMapper`

Pass the `moduleNameMapper` object from your Jest configuration to check mocks
that use mapped module names. The keys are regular expressions and the values
are strings or ordered arrays of strings. As in Jest, mappings are checked in
order and only the first matching pattern is used. A target can use capture
groups such as `$1`; an array lets the rule try the targets in order until it
finds one that resolves.

```js
const jest = require('eslint-plugin-jest');
const { moduleNameMapper } = require('./jest.config');

module.exports = [
  {
    plugins: { jest },
    rules: {
      'jest/valid-mock-module-path': ['error', { moduleNameMapper }],
    },
  },
];
```

For example, with a mapping of `'^@lib/(.*)$'` to `'<rootDir>/src/lib/$1'`,
`jest.mock('@lib/utils')` checks for `src/lib/utils` from the configured root
using `moduleFileExtensions`. If no target in the matching mapping resolves, the
rule reports the mock even if the original module name would otherwise resolve.
If no pattern matches, the rule checks the original module name.

The rule doesn't load the Jest configuration automatically.

### `rootDir`

The `<rootDir>` token in `moduleNameMapper` targets defaults to ESLint's working
directory. If your Jest project uses a different root, pass it as `rootDir` in
the rule options. A relative `rootDir` is resolved from ESLint's working
directory.

## When Not To Use It

Don't use this rule on non-jest test files.
