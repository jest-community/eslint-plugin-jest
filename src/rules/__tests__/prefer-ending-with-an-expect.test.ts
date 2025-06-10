import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../prefer-ending-with-an-expect';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('prefer-ending-with-an-expect', rule, {
  valid: [
    'it.todo("will test something eventually")',
    'test.todo("will test something eventually")',
    "['x']();",
    'it("is weird", "because this should be a function")',
    'it("is weird", "because this should be a function", () => {})',
    'it("should pass", () => expect(true).toBeDefined())',
    'test("should pass", () => expect(true).toBeDefined())',
    'it("should pass", myTest); function myTest() { expect(true).toBeDefined() }',
    {
      code: dedent`
        test('should pass', () => {
          expect(true).toBeDefined();
          foo(true).toBe(true);
        });
      `,
      options: [{ assertFunctionNames: ['expect', 'foo'] }],
    },
    {
      code: 'it("should return undefined",() => expectSaga(mySaga).returns());',
      options: [{ assertFunctionNames: ['expectSaga'] }],
    },
    {
      code: "test('verifies expect method call', () => expect$(123));",
      options: [{ assertFunctionNames: ['expect\\$'] }],
    },
    {
      code: "test('verifies expect method call', () => new Foo().expect(123));",
      options: [{ assertFunctionNames: ['Foo.expect'] }],
    },
    {
      code: dedent`
        test('verifies deep expect method call', () => {
          tester.foo().expect(123);
        });
      `,
      options: [{ assertFunctionNames: ['tester.foo.expect'] }],
    },
    {
      code: dedent`
        test('verifies chained expect method call', () => {
          doSomething();

          tester
            .foo()
            .bar()
            .expect(456);
        });
      `,
      options: [{ assertFunctionNames: ['tester.foo.bar.expect'] }],
    },
    {
      code: dedent`
        test("verifies the function call", () => {
          td.verify(someFunctionCall())
        })
      `,
      options: [{ assertFunctionNames: ['td.verify'] }],
    },
    {
      code: 'it("should pass", async () => expect(true).toBeDefined())',
      parserOptions: { ecmaVersion: 2017 },
    },
    {
      code: 'it("should pass", () => expect(true).toBeDefined())',
      options: [
        {
          assertFunctionNames: undefined,
          additionalTestBlockFunctions: undefined,
        },
      ],
    },
    'it("should pass", () => { expect(true).toBeDefined() })',
    'it("should pass", function () { expect(true).toBeDefined() })',
    dedent`
      it('is a complete test', () => {
        const container = render(Greeter);

        expect(container).toBeDefined();

        container.setProp('name', 'Bob');

        expect(container.toHTML()).toContain('Hello Bob!');
      });
    `,
    {
      code: dedent`
        it('is a complete test', async () => {
          const container = render(Greeter);

          expect(container).toBeDefined();

          container.setProp('name', 'Bob');

          await expect(container.toHTML()).resolve.toContain('Hello Bob!');
        });
      `,
      parserOptions: { ecmaVersion: 2017 },
    },
    {
      code: dedent`
        it('is a complete test', async function () {
          const container = render(Greeter);

          expect(container).toBeDefined();

          container.setProp('name', 'Bob');

          await expect(container.toHTML()).resolve.toContain('Hello Bob!');
        });
      `,
      parserOptions: { ecmaVersion: 2017 },
    },
    {
      code: dedent`
        describe('GET /user', function () {
          it('responds with json', function (done) {
            doSomething();
            request(app).get('/user').expect('Content-Type', /json/).expect(200, done);
          });
        });
      `,
      options: [{ assertFunctionNames: ['expect', 'request.**.expect'] }],
    },
    {
      code: dedent`
        each([
          [2, 3],
          [1, 3],
        ]).test(
          'the selection can change from %d to %d',
          (firstSelection, secondSelection) => {
            const container = render(MySelect, {
              props: { options: [1, 2, 3], selected: firstSelection },
            });

            expect(container).toBeDefined();
            expect(container.toHTML()).toContain(
              \`<option value="$\{firstSelection}" selected>\`
            );

            container.setProp('selected', secondSelection);

            expect(container.toHTML()).not.toContain(
              \`<option value="$\{firstSelection}" selected>\`
            );
            expect(container.toHTML()).toContain(
              \`<option value="$\{secondSelection}" selected>\`
            );
          }
        );
      `,
      options: [{ additionalTestBlockFunctions: ['each.test'] }],
    },
  ],
  invalid: [
    {
      code: 'it("should fail", () => {});',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'test("should fail", () => {});',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'test.skip("should fail", () => {});',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
    },
    {
      code: 'it("should fail", () => { somePromise.then(() => {}); });',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'test("should fail", () => { foo(true).toBe(true); })',
      options: [{ assertFunctionNames: ['expect'] }],
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should also fail",() => expectSaga(mySaga).returns());',
      options: [{ assertFunctionNames: ['expect'] }],
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should pass", () => somePromise().then(() => expect(true).toBeDefined()))',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should pass", () => render(Greeter))',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should pass", () => { render(Greeter) })',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should pass", function () { render(Greeter) })',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should not pass", () => class {})',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should not pass", () => ([]))',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should not pass", () => { const x = []; })',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'it("should not pass", function () { class Mx {} })',
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: dedent`
        it('is a complete test', () => {
          const container = render(Greeter);

          expect(container).toBeDefined();

          container.setProp('name', 'Bob');
        });
      `,
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: dedent`
        it('is a complete test', async () => {
          const container = render(Greeter);

          await expect(container).toBeDefined();

          await container.setProp('name', 'Bob');
        });
      `,
      parserOptions: { ecmaVersion: 2017 },
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
  ],
});

ruleTester.run('wildcards', rule, {
  valid: [
    {
      code: "test('should pass *', () => expect404ToBeLoaded());",
      options: [{ assertFunctionNames: ['expect*'] }],
    },
    {
      code: "test('should pass *', () => expect.toHaveStatus404());",
      options: [{ assertFunctionNames: ['expect.**'] }],
    },
    {
      code: "test('should pass', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['tester.*.expect'] }],
    },
    {
      code: "test('should pass **', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['**'] }],
    },
    {
      code: "test('should pass *', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['*'] }],
    },
    {
      code: "test('should pass', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['tester.**'] }],
    },
    {
      code: "test('should pass', () => tester.foo().expect(123));",
      options: [{ assertFunctionNames: ['tester.*'] }],
    },
    {
      code: "test('should pass', () => tester.foo().bar().expectIt(456));",
      options: [{ assertFunctionNames: ['tester.**.expect*'] }],
    },
    {
      code: "test('should pass', () => request.get().foo().expect(456));",
      options: [{ assertFunctionNames: ['request.**.expect'] }],
    },
    {
      code: "test('should pass', () => request.get().foo().expect(456));",
      options: [{ assertFunctionNames: ['request.**.e*e*t'] }],
    },
  ],
  invalid: [
    {
      code: "test('should fail', () => request.get().foo().expect(456));",
      options: [{ assertFunctionNames: ['request.*.expect'] }],
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: "test('should fail', () => request.get().foo().bar().expect(456));",
      options: [{ assertFunctionNames: ['request.foo**.expect'] }],
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: "test('should fail', () => tester.request(123));",
      options: [{ assertFunctionNames: ['request.*'] }],
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: "test('should fail', () => request(123));",
      options: [{ assertFunctionNames: ['request.*'] }],
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: "test('should fail', () => request(123));",
      options: [{ assertFunctionNames: ['request.**'] }],
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
  ],
});

ruleTester.run('aliases', rule, {
  valid: [
    {
      code: dedent`
        import { test } from '@jest/globals';

        test('should pass', () => {
          expect(true).toBeDefined();
          foo(true).toBe(true);
        });
      `,
      options: [{ assertFunctionNames: ['expect', 'foo'] }],
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        import { test as checkThat } from '@jest/globals';

        checkThat('this passes', () => {
          expect(true).toBeDefined();
          foo(true).toBe(true);
        });
      `,
      options: [{ assertFunctionNames: ['expect', 'foo'] }],
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        const { test } = require('@jest/globals');

        test('verifies chained expect method call', () => {
          tester
            .foo()
            .bar()
            .expect(456);
        });
      `,
      options: [{ assertFunctionNames: ['tester.foo.bar.expect'] }],
      parserOptions: { sourceType: 'module' },
    },
  ],
  invalid: [
    {
      code: dedent`
        import { test as checkThat } from '@jest/globals';

        checkThat('this passes', () => {
          // ...
        });
      `,
      options: [{ assertFunctionNames: ['expect', 'foo'] }],
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: dedent`
        import { test as checkThat } from '@jest/globals';

        checkThat.skip('this passes', () => {
          // ...
        });
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'mustEndWithExpect',
          type: AST_NODE_TYPES.MemberExpression,
        },
      ],
    },
  ],
});
