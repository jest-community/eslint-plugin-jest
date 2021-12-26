# Suggest having hooks before any test cases (`prefer-hooks-on-top`)

All hooks should be defined before the start of the tests

## Rule Details

Examples of **incorrect** code for this rule

```js
/* eslint jest/prefer-hooks-on-top: "error" */

describe('foo', () => {
  beforeEach(() => {
    seedMyDatabase();
  });

  it('accepts this input', () => {
    // ...
  });

  beforeAll(() => {
    createMyDatabase();
  });

  it('returns that value', () => {
    // ...
  });

  describe('when the database has specific values', () => {
    const specificValue = '...';

    beforeEach(() => {
      seedMyDatabase(specificValue);
    });

    it('accepts that input', () => {
      // ...
    });

    it('throws an error', () => {
      // ...
    });

    afterEach(() => {
      clearLogger();
    });
    beforeEach(() => {
      mockLogger();
    });

    it('logs a message', () => {
      // ...
    });
  });

  afterAll(() => {
    removeMyDatabase();
  });
});
```

Examples of **correct** code for this rule

```js
/* eslint jest/prefer-hooks-on-top: "error" */

describe('foo', () => {
  beforeAll(() => {
    createMyDatabase();
  });

  beforeEach(() => {
    seedMyDatabase();
  });

  afterAll(() => {
    clearMyDatabase();
  });

  it('accepts this input', () => {
    // ...
  });

  it('returns that value', () => {
    // ...
  });

  describe('when the database has specific values', () => {
    const specificValue = '...';

    beforeEach(() => {
      seedMyDatabase(specificValue);
    });

    beforeEach(() => {
      mockLogger();
    });

    afterEach(() => {
      clearLogger();
    });

    it('accepts that input', () => {
      // ...
    });

    it('throws an error', () => {
      // ...
    });

    it('logs a message', () => {
      // ...
    });
  });
});
```
