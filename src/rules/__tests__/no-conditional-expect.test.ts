import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-conditional-expect';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2019,
  },
});

ruleTester.run('common tests', rule, {
  valid: [
    `
      it('foo', () => {
        expect(1).toBe(2);
      });
    `,
    `
      it('foo', () => {
        expect(!true).toBe(false);
      });
    `,
  ],
  invalid: [],
});

ruleTester.run('logical conditions', rule, {
  valid: [
    `
      it('foo', () => {
        process.env.FAIL && setNum(1);

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        let num = 2;

        process.env.FAIL && setNum(1);

        return num;
      }

      it('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
    `
      it('foo', () => {
        process.env.FAIL || setNum(1);

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        let num = 2;

        process.env.FAIL || setNum(1);

        return num;
      }

      it('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
  invalid: [
    {
      code: `
        it('foo', () => {
          something && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          a || b && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          (a || b) && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          a || (b && expect(something).toHaveBeenCalled());
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          a && b && expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          a && b || expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          (a && b) || expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        function getValue() {
          something && expect(something).toHaveBeenCalled(); 
        }

        it('foo', getValue);
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          something || expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        function getValue() {
          something || expect(something).toHaveBeenCalled(); 
        }

        it('foo', getValue);
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
  ],
});

ruleTester.run('conditional conditions', rule, {
  valid: [
    `
      it('foo', () => {
        const num = process.env.FAIL ? 1 : 2;

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        return process.env.FAIL ? 1 : 2
      }

      it('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
  invalid: [
    {
      code: `
        it('foo', () => {
          something ? expect(something).toHaveBeenCalled() : noop();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        function getValue() {
          something ? expect(something).toHaveBeenCalled() : noop();
        }

        it('foo', getValue);
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          something ? noop() : expect(something).toHaveBeenCalled();
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        function getValue() {
          something ? noop() : expect(something).toHaveBeenCalled();
        }

        it('foo', getValue);
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
  ],
});

ruleTester.run('switch conditions', rule, {
  valid: [
    `
      it('foo', () => {
        let num;

        switch(process.env.FAIL) {
          case true:
            num = 1;
            break;
          case false:
            num = 2;
            break;
        }

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        switch(process.env.FAIL) {
          case true:
            return 1;
          case false:
            return 2;
        }
      }

      it('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
  invalid: [
    {
      code: `
        it('foo', () => {
          switch(something) {
            case 'value':
              break;
            default:
              expect(something).toHaveBeenCalled();
          }
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          switch(something) {
            case 'value':
              expect(something).toHaveBeenCalled();
            default:
              break;
          }
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        function getValue() {
          switch(something) {
            case 'value':
              break;
            default:
              expect(something).toHaveBeenCalled();
          }
        }

        it('foo', getValue);
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
  ],
});

ruleTester.run('if conditions', rule, {
  valid: [
    `
      it('foo', () => {
        let num = 2;

        if(process.env.FAIL) {
          num = 1;
        }

        expect(num).toBe(2);
      });
    `,
    `
      function getValue() {
        if(process.env.FAIL) {
          return 1;
        }

        return 2;
      }

      it('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
  invalid: [
    {
      code: `
        it('foo', () => {
          if(doSomething) {
            expect(something).toHaveBeenCalled();
          }
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        it('foo', () => {
          if(!doSomething) {
            // do nothing
          } else {
            expect(something).toHaveBeenCalled();
          }
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        function getValue() {
          if(doSomething) {
            expect(something).toHaveBeenCalled();
          }
        }

        it('foo', getValue);
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        function getValue() {
          if(!doSomething) {
            // do nothing
          } else {
            expect(something).toHaveBeenCalled();
          }
        }

        it('foo', getValue);
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
  ],
});

ruleTester.run('catch conditions', rule, {
  valid: [
    `
      it('foo', () => {
        try {
          // do something
        } catch {
          // ignore errors
        } finally {
          expect(something).toHaveBeenCalled();
        }
      });
    `,
    `
      it('foo', () => {
        try {
          // do something
        } catch {
          // ignore errors
        }

        expect(something).toHaveBeenCalled();
      });
    `,
    `
      function getValue() {
        try {
          // do something
        } catch {
          // ignore errors
        } finally {
          expect(something).toHaveBeenCalled();
        }
      }

      it('foo', getValue);
    `,
    `
      function getValue() {
        try {
          process.env.FAIL.toString();

          return 1;
        } catch {
          return 2;
        }
      }

      it('foo', () => {
        expect(getValue()).toBe(2);
      });
    `,
  ],
  invalid: [
    {
      code: `
        it('foo', () => {
          try {
  
          } catch (err) {
            expect(err).toMatch('Error');
          }
        })
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    {
      code: `
        function getValue() {
          try {
            // do something
          } catch {
            expect(something).toHaveBeenCalled();
          }
        }

        it('foo', getValue);
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
  ],
});
