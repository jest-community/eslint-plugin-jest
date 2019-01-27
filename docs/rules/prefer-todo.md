# Suggest using `test.todo` (prefer-todo)

When test cases are empty then it is better to mark them as `test.todo` as it
will be highlighted in the summary output.

## Rule details

This rule triggers a warning if empty test case is used without 'test.todo'.

```js
test('i need to write this test');
```

This rule is enabled by default.

### Default configuration

The following pattern is considered warning:

```js
test('i need to write this test');
```

The following pattern is not warning:

```js
test.todo('i need to write this test');
```
