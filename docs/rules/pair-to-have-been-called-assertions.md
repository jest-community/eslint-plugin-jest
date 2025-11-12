# Require `toHaveBeenCalledTimes()` when using `toHaveBeenCalledWith()` (`pair-to-have-been-called-assertions`)

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

When testing mock functions, developers often use `toHaveBeenCalledWith()`,
`toBeCalledWith()`, `toHaveBeenNthCalledWith()`, `toBeNthCalledWith()`,
`toHaveBeenLastCalledWith()`, or `toBeLastCalledWith()` to verify that a
function was called with specific arguments. However, without also checking the
call count using `toHaveBeenCalledTimes()` or `toBeCalledTimes()`, the test can
pass even if the mock was called more times than expected, potentially masking
bugs.

This rule requires that whenever you use these matchers with arguments, you must
also use the corresponding `toHaveBeenCalledTimes()` or `toBeCalledTimes()`
matcher for the same mock function to ensure an exact call count.

### Benefits

- **Prevents false positives**: Ensures tests fail when a mock is called more
  times than expected
- **Makes test intentions explicit**: Clearly documents how many times a
  function should be called
- **Improves test reliability**: Catches unexpected behavior where functions are
  called multiple times
- **Follows testing best practices**: Encourages complete and precise assertions

## Examples

### Incorrect

```js
expect(mockFn).toHaveBeenCalledWith('arg');

expect(mockFn).toBeCalledWith('arg');

// Multiple assertions without call count check
expect(mockFn).toHaveBeenCalledWith('arg1');
expect(mockFn).toHaveBeenCalledWith('arg2');

// Using toHaveBeenNthCalledWith without call count
expect(mockFn).toHaveBeenNthCalledWith(1, 'first');

// Using toHaveBeenLastCalledWith without call count
expect(mockFn).toHaveBeenLastCalledWith('last');

// Using toBeNthCalledWith without call count
expect(mockFn).toBeNthCalledWith(2, 'second');

// Using toBeLastCalledWith without call count
expect(mockFn).toBeLastCalledWith('last');
```

### Correct

```js
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg');

expect(mockFn).toBeCalledTimes(1);
expect(mockFn).toBeCalledWith('arg');

// Multiple mocks, each with call count
expect(mockFn1).toHaveBeenCalledTimes(1);
expect(mockFn1).toHaveBeenCalledWith('arg1');
expect(mockFn2).toHaveBeenCalledTimes(1);
expect(mockFn2).toHaveBeenCalledWith('arg2');

// Using toHaveBeenNthCalledWith with call count
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenNthCalledWith(1, 'first');

// Using toHaveBeenLastCalledWith with call count
expect(mockFn).toHaveBeenCalledTimes(3);
expect(mockFn).toHaveBeenLastCalledWith('last');

// Using toBeNthCalledWith with call count
expect(mockFn).toBeCalledTimes(2);
expect(mockFn).toBeNthCalledWith(2, 'second');

// Using toBeLastCalledWith with call count
expect(mockFn).toBeCalledTimes(1);
expect(mockFn).toBeLastCalledWith('only');

// Mixed matchers with call count
expect(mockFn).toHaveBeenCalledTimes(3);
expect(mockFn).toHaveBeenCalledWith('arg1');
expect(mockFn).toHaveBeenNthCalledWith(2, 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg3');

// Empty call (no arguments) doesn't require call count
expect(mockFn).toHaveBeenCalledWith();

// Using 'not' modifier doesn't require call count
expect(mockFn).not.toHaveBeenCalledWith('arg');

// Only checking call count is fine
expect(mockFn).toHaveBeenCalledTimes(1);
```

## Additional Checks

### Contradictory Assertions

This rule also detects contradictory assertions where `toHaveBeenCalledTimes(0)`
is used together with `toHaveBeenCalledWith()`. Since `toHaveBeenCalledWith()`
expects the mock to be called at least once, using it with
`toHaveBeenCalledTimes(0)` is contradictory.

```js
// ❌ Incorrect - contradictory assertions
test('foo', () => {
  expect(mockFn).toHaveBeenCalledTimes(0);
  expect(mockFn).toHaveBeenCalledWith('arg'); // This expects a call!
});

// ✅ Correct - consistent assertions
test('foo', () => {
  expect(mockFn).toHaveBeenCalledTimes(0);
  // No CalledWith assertions
});

// ✅ Correct - consistent assertions
test('foo', () => {
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn).toHaveBeenCalledWith('arg');
});
```

## When Not To Use It

If you have a specific testing strategy where checking call counts is not
necessary or you're only interested in verifying that a function was called with
specific arguments at least once, you can disable this rule.

However, it's generally recommended to keep this rule enabled as it helps catch
bugs where functions are called more times than expected, leading to more robust
and reliable tests.
