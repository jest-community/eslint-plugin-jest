import { RuleTester } from 'eslint';
import rule from '../no-duplicate-hooks';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('basic describe block', rule, {
  valid: [
    [
      'describe("foo", () => {',
      '  beforeEach(() => {',
      '  }),',
      '  test("bar", () => {',
      '    some_fn();',
      '  })',
      '})',
    ].join('\n'),
    [
      'beforeEach(() => {',
      '}),',
      'test("bar", () => {',
      '  some_fn();',
      '})',
    ].join('\n'),
    [
      'describe("foo", () => {',
      '  beforeAll(() => {',
      '  }),',
      '  beforeEach(() => {',
      '  }),',
      '  afterEach(() => {',
      '  }),',
      '  afterAll(() => {',
      '  }),',
      '  test("bar", () => {',
      '    some_fn();',
      '  })',
      '})',
    ].join('\n'),
  ],

  invalid: [
    {
      code: [
        'describe("foo", () => {',
        '  beforeEach(() => {',
        '  }),',
        '  beforeEach(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 4,
        },
      ],
    },
    {
      code: [
        'describe.skip("foo", () => {',
        '  beforeEach(() => {',
        '  }),',
        '  beforeAll(() => {',
        '  }),',
        '  beforeAll(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeAll' },
          column: 3,
          line: 6,
        },
      ],
    },
    {
      code: [
        'describe.skip("foo", () => {',
        '  afterEach(() => {',
        '  }),',
        '  afterEach(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'afterEach' },
          column: 3,
          line: 4,
        },
      ],
    },
    {
      code: [
        'describe.skip("foo", () => {',
        '  afterAll(() => {',
        '  }),',
        '  afterAll(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'afterAll' },
          column: 3,
          line: 4,
        },
      ],
    },
    {
      code: [
        'afterAll(() => {',
        '}),',
        'afterAll(() => {',
        '}),',
        'test("bar", () => {',
        '  some_fn();',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'afterAll' },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: [
        'describe("foo", () => {',
        '  beforeEach(() => {',
        '  }),',
        '  beforeEach(() => {',
        '  }),',
        '  beforeEach(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 4,
        },
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 6,
        },
      ],
    },
    {
      code: [
        'describe.skip("foo", () => {',
        '  afterAll(() => {',
        '  }),',
        '  afterAll(() => {',
        '  }),',
        '  beforeAll(() => {',
        '  }),',
        '  beforeAll(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'afterAll' },
          column: 3,
          line: 4,
        },
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeAll' },
          column: 3,
          line: 8,
        },
      ],
    },
  ],
});

ruleTester.run('multiple describe blocks', rule, {
  valid: [
    [
      'describe.skip("foo", () => {',
      '  beforeEach(() => {',
      '  }),',
      '  beforeAll(() => {',
      '  }),',
      '  test("bar", () => {',
      '    some_fn();',
      '  })',
      '})',
      'describe("foo", () => {',
      '  beforeEach(() => {',
      '  }),',
      '  beforeAll(() => {',
      '  }),',
      '  test("bar", () => {',
      '    some_fn();',
      '  })',
      '})',
    ].join('\n'),
  ],

  invalid: [
    {
      code: [
        'describe.skip("foo", () => {',
        '  beforeEach(() => {',
        '  }),',
        '  beforeAll(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '})',
        'describe("foo", () => {',
        '  beforeEach(() => {',
        '  }),',
        '  beforeEach(() => {',
        '  }),',
        '  beforeAll(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 3,
          line: 13,
        },
      ],
    },
  ],
});

ruleTester.run('nested describe blocks', rule, {
  valid: [
    [
      'describe("foo", () => {',
      '  beforeEach(() => {',
      '  }),',
      '  test("bar", () => {',
      '    some_fn();',
      '  })',
      '  describe("inner_foo", () => {',
      '    beforeEach(() => {',
      '    })',
      '    test("inner bar", () => {',
      '      some_fn();',
      '    })',
      '  })',
      '})',
    ].join('\n'),
  ],

  invalid: [
    {
      code: [
        'describe("foo", () => {',
        '  beforeAll(() => {',
        '  }),',
        '  test("bar", () => {',
        '    some_fn();',
        '  })',
        '  describe("inner_foo", () => {',
        '    beforeEach(() => {',
        '    })',
        '    beforeEach(() => {',
        '    })',
        '    test("inner bar", () => {',
        '      some_fn();',
        '    })',
        '  })',
        '})',
      ].join('\n'),
      errors: [
        {
          messageId: 'noDuplicateHook',
          data: { hook: 'beforeEach' },
          column: 5,
          line: 10,
        },
      ],
    },
  ],
});
