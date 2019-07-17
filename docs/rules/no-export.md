# no export from test file (no-export)

I ran into this issue when we had a set of helper functions in 1 test file that
got exported directly from a `-test.js` file. The test that was importing this
file then executes both it's own tests as well as the tests in the imported
file. We started seeing phantom snapshots show up that we weren't able to find
the origin of until we finally tracked it down and realized that a test file was
exporting shared functions. We fixed this by moving those functions out into
seperate files, but that was the inspiration of this rule.

## Rule Details

This rule aims to eliminate duplicate runs of tests by exporting things from
test files. If you import from a test file, then all the tests in that file will
be run in each imported instance, so bottom line, don't export from a test, but
instead move helper functions into a seperate file when they need to be shared
across tests.

Examples of **incorrect** code for this rule:

```js
export function myHelper() {}

module.exports = function() {};

module.exports = {
  something: 'that should be moved to a non-test file',
};

describe('a test', () => {
  expect(1).toBe(1);
});
```

Examples of **correct** code for this rule:

```js
function myHelper() {}

const myThing = {
  something: 'that can live here',
};

describe('a test', () => {
  expect(1).toBe(1);
});
```

## When Not To Use It

Don't use this rule on non-jest test files.
