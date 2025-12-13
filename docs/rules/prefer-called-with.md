# Suggest using `toHaveBeenCalledWith()` (`prefer-called-with`)

<!-- end auto-generated rule header -->

The `toHaveBeenCalled()` matcher is used to assert that a mock function has been
called one or more times, without checking the arguments passed. The assertion
is stronger when arguments are also validated using the `toHaveBeenCalledWith()`
matcher. When some arguments are difficult to check, using generic match like
`expect.anything()` at least enforces number and position of arguments.

This rule warns if the form without argument checking is used, except for `.not`
enforcing a function has never been called.

## Rule details

The following patterns are warnings:

```js
expect(someFunction).toBeCalled();

expect(someFunction).toHaveBeenCalled();
```

The following patterns are not warnings:

```js
expect(noArgsFunction).toHaveBeenCalledWith();

expect(roughArgsFunction).toHaveBeenCalledWith(
  expect.anything(),
  expect.any(Date),
);

expect(anyArgsFunction).toHaveBeenCalledTimes(1);

expect(uncalledFunction).not.toHaveBeenCalled();
```
