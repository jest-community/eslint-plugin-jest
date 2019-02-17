# Disallow unfinished tests (no-test-todo)

Jest allows you to plan tests by only providing the test description
([Jest Documentation](https://jestjs.io/docs/en/api#testtodoname)).  
This rule can be used to ensure that none of these unfinished tests will be
committed or to be reminded of unfinished tests by setting the rule severity to
warn.

## Rule details

This rule triggers a warning if you add the modifier `.todo` to `test` or `it`.

```js
// valid:
it('test description', () => {});

test('test description', () => {});

it.skip('test description', () => {});

it.only('test description', () => {});

// invalid:
it.todo('test description');

test.todo('test description');
```
