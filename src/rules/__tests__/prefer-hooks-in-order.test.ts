import dedent from 'dedent';
import rule from '../prefer-hooks-in-order';
import { FlatCompatRuleTester, espreeParser } from './test-utils';

const ruleTester = new FlatCompatRuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-hooks-in-order', rule, {
  valid: [
    'beforeAll(() => {})',
    'beforeEach(() => {})',
    'afterEach(() => {})',
    'afterAll(() => {})',
    'describe(() => {})',
    dedent`
      beforeAll(() => {});
      beforeEach(() => {});
      afterEach(() => {});
      afterAll(() => {});
    `,
    dedent`
      describe('foo', () => {
        someSetupFn();
        beforeEach(() => {});
        afterEach(() => {});

        test('bar', () => {
          someFn();
        });
      });
    `,
    dedent`
      beforeAll(() => {});
      afterAll(() => {});
    `,
    dedent`
      beforeEach(() => {});
      afterEach(() => {});
    `,
    dedent`
      beforeAll(() => {});
      afterEach(() => {});
    `,
    dedent`
      beforeAll(() => {});
      beforeEach(() => {});
    `,
    dedent`
      afterEach(() => {});
      afterAll(() => {});
    `,
    dedent`
      beforeAll(() => {});
      beforeAll(() => {});
    `,
    dedent`
      describe('my test', () => {
        afterEach(() => {});
        afterAll(() => {});
      });
    `,
    dedent`
      describe('my test', () => {
        afterEach(() => {});
        afterAll(() => {});

        doSomething();

        beforeAll(() => {});
        beforeEach(() => {});
      });
    `,
    dedent`
      describe('my test', () => {
        afterEach(() => {});
        afterAll(() => {});

        it('is a test', () => {});

        beforeAll(() => {});
        beforeEach(() => {});
      });
    `,
    dedent`
      describe('my test', () => {
        afterAll(() => {});

        describe('when something is true', () => {
          beforeAll(() => {});
          beforeEach(() => {});
        });
      });
    `,
    dedent`
      describe('my test', () => {
        afterAll(() => {});

        describe('when something is true', () => {
          beforeAll(() => {});
          beforeEach(() => {});

          it('does something', () => {});

          beforeAll(() => {});
          beforeEach(() => {});
        });

        beforeAll(() => {});
        beforeEach(() => {});
      });

      describe('my test', () => {
        beforeAll(() => {});
        beforeEach(() => {});
        afterAll(() => {});

        describe('when something is true', () => {
          it('does something', () => {});

          beforeAll(() => {});
          beforeEach(() => {});
        });

        beforeAll(() => {});
        beforeEach(() => {});
      });
    `,
    dedent`
      const withDatabase = () => {
        beforeAll(() => {
          createMyDatabase();
        });
        afterAll(() => {
          removeMyDatabase();
        });
      };

      describe('my test', () => {
        withDatabase();

        afterAll(() => {});

        describe('when something is true', () => {
          beforeAll(() => {});
          beforeEach(() => {});

          it('does something', () => {});

          beforeAll(() => {});
          beforeEach(() => {});
        });

        beforeAll(() => {});
        beforeEach(() => {});
      });

      describe('my test', () => {
        beforeAll(() => {});
        beforeEach(() => {});
        afterAll(() => {});

        withDatabase();

        describe('when something is true', () => {
          it('does something', () => {});

          beforeAll(() => {});
          beforeEach(() => {});
        });

        beforeAll(() => {});
        beforeEach(() => {});
      });
    `,
    dedent`
      describe('foo', () => {
        beforeAll(() => {
          createMyDatabase();
        });
      
        beforeEach(() => {
          seedMyDatabase();
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
      
          it('accepts that input', () => {
            // ...
          });
      
          it('throws an error', () => {
            // ...
          });
      
          beforeEach(() => {
            mockLogger();
          });
      
          afterEach(() => {
            clearLogger();
          });
      
          it('logs a message', () => {
            // ...
          });
        });
      
        afterAll(() => {
          removeMyDatabase();
        });
      });
    `,
    dedent`
      describe('A file with a lot of test', () => {
        beforeAll(() => {
          setupTheDatabase();
          createMocks();
        });
        
        beforeAll(() => {
          doEvenMore();
        });
        
        beforeEach(() => {
          cleanTheDatabase();
          resetSomeThings();
        });
        
        afterEach(() => {
          cleanTheDatabase();
          resetSomeThings();
        });
        
        afterAll(() => {
          closeTheDatabase();
          stop();
        });
        
        it('does something', () => {
          const thing = getThing();
          expect(thing).toBe('something');
        });
        
        it('throws', () => {
          // Do something that throws
        });
        
        describe('Also have tests in here', () => {
          afterAll(() => {});
          it('tests something', () => {});
          it('tests something else', () => {});
          beforeAll(()=>{});
        });
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        const withDatabase = () => {
          afterAll(() => {
            removeMyDatabase();
          });
          beforeAll(() => {
            createMyDatabase();
          });
        };
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          column: 3,
          line: 5,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {
          removeMyDatabase();
        });
        beforeAll(() => {
          createMyDatabase();
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          column: 1,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {});
        beforeAll(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        afterEach(() => {});
        beforeEach(() => {});
      `,
      errors: [
        {
          // 'beforeEach' hooks should be before any 'afterEach' hooks
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeEach', previousHook: 'afterEach' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        afterEach(() => {});
        beforeAll(() => {});
      `,
      errors: [
        {
          // 'beforeAll' hooks should be before any 'afterEach' hooks
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterEach' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        beforeEach(() => {});
        beforeAll(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {});
        afterEach(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 1,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {});
        // The afterEach should do this
        // This comment does not matter for the order
        afterEach(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 1,
          line: 4,
        },
      ],
    },
    {
      code: dedent`
        afterAll(() => {});
        afterAll(() => {});
        afterEach(() => {});
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 1,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          afterAll(() => {});
          afterEach(() => {});
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 3,
          line: 3,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          afterAll(() => {});
          afterEach(() => {});

          doSomething();

          beforeEach(() => {});
          beforeAll(() => {});
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 3,
          line: 3,
        },
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 3,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          afterAll(() => {});
          afterEach(() => {});

          it('is a test', () => {});

          beforeEach(() => {});
          beforeAll(() => {});
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 3,
          line: 3,
        },
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 3,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          afterAll(() => {});

          describe('when something is true', () => {
            beforeEach(() => {});
            beforeAll(() => {});
          });
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 5,
          line: 6,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          beforeAll(() => {});
          afterAll(() => {});
          beforeAll(() => {});

          describe('when something is true', () => {
            beforeAll(() => {});
            afterEach(() => {});
            beforeEach(() => {});
            afterEach(() => {});
          });
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'afterAll' },
          column: 3,
          line: 4,
        },
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeEach', previousHook: 'afterEach' },
          column: 5,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          beforeAll(() => {});
          beforeAll(() => {});
          afterAll(() => {});
          
          it('foo nested', () => {
            // this is a test
          });

          describe('when something is true', () => {
            beforeAll(() => {});
            afterEach(() => {});
            
            it('foo nested', () => {
              // this is a test
            });
            
            describe('deeply nested', () => { 
              afterAll(() => {});
              afterAll(() => {});
              // This comment does nothing
              afterEach(() => {});
              
              it('foo nested', () => {
                // this is a test
              });
            })
            beforeEach(() => {});
            afterEach(() => {});
          });
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 7,
          line: 22,
        },
      ],
    },
    {
      code: dedent`
        describe('my test', () => {
          const setupDatabase = () => {
            beforeEach(() => {
              initDatabase();
              fillWithData();
            });
            beforeAll(() => {
              setupMocks();
            });
          };
          
          it('foo', () => {
            // this is a test
          });
          
          describe('my nested test', () => {
            afterAll(() => {});
            afterEach(() => {});
            
            it('foo nested', () => {
              // this is a test
            });
          });
        });
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 5,
          line: 7,
        },
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'afterEach', previousHook: 'afterAll' },
          column: 5,
          line: 18,
        },
      ],
    },
    {
      code: dedent`
        describe('foo', () => {
          beforeEach(() => {
            seedMyDatabase();
          });
        
          beforeAll(() => {
            createMyDatabase();
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
      `,
      errors: [
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeAll', previousHook: 'beforeEach' },
          column: 3,
          line: 6,
        },
        {
          messageId: 'reorderHooks',
          data: { currentHook: 'beforeEach', previousHook: 'afterEach' },
          column: 5,
          line: 37,
        },
      ],
    },
  ],
});
