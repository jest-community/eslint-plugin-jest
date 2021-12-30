import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import rule from '../prefer-snapshot-hint';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-snapshot-hint (always)', rule, {
  valid: [
    {
      code: 'expect(something).toStrictEqual(somethingElse);',
      options: ['always'],
    },
    {
      code: "a().toEqual('b')",
      options: ['always'],
    },
    {
      code: 'expect(a);',
      options: ['always'],
    },
    {
      code: 'expect(1).toMatchSnapshot({}, "my snapshot");',
      options: ['always'],
    },
    {
      code: 'expect(1).toThrowErrorMatchingSnapshot("my snapshot");',
      options: ['always'],
    },
    {
      code: 'expect(1).toMatchInlineSnapshot();',
      options: ['always'],
    },
    {
      code: 'expect(1).toThrowErrorMatchingInlineSnapshot();',
      options: ['always'],
    },
  ],
  invalid: [
    {
      code: 'expect(1).toMatchSnapshot();',
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1).toMatchSnapshot({});',
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(1).toThrowErrorMatchingSnapshot();',
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
        });
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
          expect(2).toMatchSnapshot();
        });
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
          expect(2).toThrowErrorMatchingSnapshot("my error");
        });
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        const expectSnapshot = value => {
          expect(value).toMatchSnapshot();
        };
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 17,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        const expectSnapshot = value => {
          expect(value).toThrowErrorMatchingSnapshot();
        };
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 17,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          { expect(1).toMatchSnapshot(); }
        });
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'missingHint',
          column: 15,
          line: 2,
        },
      ],
    },
  ],
});

ruleTester.run('prefer-snapshot-hint (multi)', rule, {
  valid: [
    {
      code: 'expect(something).toStrictEqual(somethingElse);',
      options: ['multi'],
    },
    {
      code: "a().toEqual('b')",
      options: ['multi'],
    },
    {
      code: 'expect(a);',
      options: ['multi'],
    },
    {
      code: 'expect(1).toMatchSnapshot({}, "my snapshot");',
      options: ['multi'],
    },
    {
      code: 'expect(1).toThrowErrorMatchingSnapshot("my snapshot");',
      options: ['multi'],
    },
    {
      code: 'expect(1).toMatchSnapshot({});',
      options: ['multi'],
    },
    {
      code: 'expect(1).toThrowErrorMatchingSnapshot();',
      options: ['multi'],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
        });
      `,
      options: ['multi'],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot(undefined, 'my first snapshot');
        });
      `,
      options: ['multi'],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
        });

        it('is false', () => {
          expect(2).toMatchSnapshot();
        });
      `,
      options: ['multi'],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
        });

        it('is false', () => {
          expect(2).toThrowErrorMatchingSnapshot();
        });
      `,
      options: ['multi'],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toStrictEqual(1);
          expect(1).toStrictEqual(2);
          expect(1).toMatchSnapshot();
        });

        it('is false', () => {
          expect(1).toStrictEqual(1);
          expect(1).toStrictEqual(2);
          expect(2).toThrowErrorMatchingSnapshot();
        });
      `,
      options: ['multi'],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchInlineSnapshot();
        });

        it('is false', () => {
          expect(1).toMatchInlineSnapshot();
          expect(1).toMatchInlineSnapshot();
          expect(1).toThrowErrorMatchingInlineSnapshot();
        });
      `,
      options: ['multi'],
    },
    {
      code: dedent`
        const myReusableTestBody = (value, snapshotHint) => {
          const innerFn = anotherValue => {
            expect(anotherValue).toMatchSnapshot();

            expect(value).toBe(1);
          };

          expect(value).toBe(1);
        };

        it('my test', () => {
          expect(1).toMatchSnapshot();
        });
      `,
      options: ['multi'],
    },
    {
      code: dedent`
        const myReusableTestBody = (value, snapshotHint) => {
          const innerFn = anotherValue => {
            expect(value).toBe(1);
          };

          expect(value).toBe(1);
          expect(anotherValue).toMatchSnapshot();
        };

        it('my test', () => {
          expect(1).toMatchSnapshot();
        });
      `,
      options: ['multi'],
    },
    {
      code: dedent`
        const myReusableTestBody = (value, snapshotHint) => {
          const innerFn = anotherValue => {
            expect(anotherValue).toMatchSnapshot();

            expect(value).toBe(1);
          };

          expect(value).toBe(1);
        };

        expect(1).toMatchSnapshot();
      `,
      options: ['multi'],
    },
  ],
  invalid: [
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
          expect(2).toMatchSnapshot();
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
          expect(2).toThrowErrorMatchingSnapshot();
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toThrowErrorMatchingSnapshot();
          expect(2).toMatchSnapshot();
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot({});
          expect(2).toMatchSnapshot({});
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot({});
          {
            expect(2).toMatchSnapshot({});
          }
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 15,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          { expect(1).toMatchSnapshot(); }
          { expect(2).toMatchSnapshot(); }
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 15,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 15,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot();
          expect(2).toMatchSnapshot(undefined, 'my second snapshot');
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot({});
          expect(2).toMatchSnapshot(undefined, 'my second snapshot');
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot({}, 'my first snapshot');
          expect(2).toMatchSnapshot(undefined);
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(1).toMatchSnapshot({}, 'my first snapshot');
          expect(2).toMatchSnapshot(undefined);
          expect(2).toMatchSnapshot();
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 3,
        },
        {
          messageId: 'missingHint',
          column: 13,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(2).toMatchSnapshot();
          expect(1).toMatchSnapshot({}, 'my second snapshot');
          expect(2).toMatchSnapshot();
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 13,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        it('is true', () => {
          expect(2).toMatchSnapshot(undefined);
          expect(2).toMatchSnapshot();
          expect(1).toMatchSnapshot(null, 'my third snapshot');
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 13,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        const myReusableTestBody = (value, snapshotHint) => {
          expect(value).toMatchSnapshot();

          const innerFn = anotherValue => {
            expect(anotherValue).toMatchSnapshot();
          };

          expect(value).toBe(1);
          expect(value + 1).toMatchSnapshot(null);
          expect(value + 2).toThrowErrorMatchingSnapshot(snapshotHint);
        };
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 17,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 26,
          line: 5,
        },
        {
          messageId: 'missingHint',
          column: 21,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        const myReusableTestBody = (value, snapshotHint) => {
          expect(value).toMatchSnapshot();

          const innerFn = anotherValue => {
            expect(anotherValue).toMatchSnapshot();

            expect(value).toBe(1);
            expect(value + 1).toMatchSnapshot(null);
            expect(value + 2).toMatchSnapshot(null, snapshotHint);
          };
        };
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 17,
          line: 2,
        },
        {
          messageId: 'missingHint',
          column: 26,
          line: 5,
        },
        {
          messageId: 'missingHint',
          column: 23,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        const myReusableTestBody = (value, snapshotHint) => {
          const innerFn = anotherValue => {
            expect(anotherValue).toMatchSnapshot();

            expect(value).toBe(1);
            expect(value + 1).toMatchSnapshot(null);
            expect(value + 2).toMatchSnapshot(null, snapshotHint);
          };

          expect(value).toThrowErrorMatchingSnapshot();
        };
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 26,
          line: 3,
        },
        {
          messageId: 'missingHint',
          column: 23,
          line: 6,
        },
        {
          messageId: 'missingHint',
          column: 17,
          line: 10,
        },
      ],
    },
    {
      code: dedent`
        const myReusableTestBody = (value, snapshotHint) => {
          const innerFn = anotherValue => {
            expect(anotherValue).toMatchSnapshot();

            expect(value).toBe(1);
          };

          expect(value).toMatchSnapshot();
        };

        it('my test', () => {
          expect(1).toMatchSnapshot();
        });
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 26,
          line: 3,
        },
        {
          messageId: 'missingHint',
          column: 17,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        const myReusableTestBody = value => {
          expect(value).toMatchSnapshot();
        };

        expect(1).toMatchSnapshot();
        expect(1).toThrowErrorMatchingSnapshot();
      `,
      options: ['multi'],
      errors: [
        {
          messageId: 'missingHint',
          column: 11,
          line: 5,
        },
        {
          messageId: 'missingHint',
          column: 11,
          line: 6,
        },
      ],
    },
  ],
});
