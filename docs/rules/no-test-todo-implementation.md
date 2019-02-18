# Disallow tests with .todo modifier to have an implementation (no-test-todo-implementation)

Jest allows you to plan tests by only providing the test description
([Jest Documentation](https://jestjs.io/docs/en/api#testtodoname)).  
If an implementation for the test is supplied by the second argument, jest will
throw an error.

## Rule details

This rule triggers a warning if a test block with the modifier `.todo` has an
implementation.

```js
// valid:
it('test description', () => {});

test('test description', () => {});

it.skip('test description', () => {});

it.only('test description', () => {});

it.todo('test description');

// invalid:
it.todo('test description', () => {});

test.todo('test description', () => {
  expect(true).toBe(true);
});
```
