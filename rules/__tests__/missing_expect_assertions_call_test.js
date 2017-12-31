'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../..').rules;

const ruleTester = new RuleTester();
const expectedMsg =
  'Every test should have expect.assertions({number of assertions}) as first expression';

ruleTester.run(
  'missing-expect-assertions-call',
  rules['missing-expect-assertions-call'],
  {
    invalid: [
      {
        code: 'it("it1", () => { foo()})',
        errors: [
          {
            message: expectedMsg,
          },
        ],
        parserOptions: { ecmaVersion: 6 },
      },
      {
        code:
          'it("it1", function() {' +
          '\n\t\t\tsomeFunctionToDo();' +
          '\n\t\t\tsomeFunctionToDo2();\n' +
          '\t\t\t})',
        errors: [
          {
            message: expectedMsg,
          },
        ],
      },
      {
        code: 'it("it1", function() {var a = 2;})',
        errors: [
          {
            message: expectedMsg,
          },
        ],
      },
    ],

    valid: [
      {
        code: 'test("it1", () => {expect.assertions(0);})',
        parserOptions: { ecmaVersion: 6 },
      },
      'test("it1", function() {expect.assertions(0);})',
      'it("it1", function() {expect.assertions(0);})',
      'it("it1", function() {\n\t\t\texpect.assertions(1);' +
        '\n\t\t\texpect(someValue).toBe(true)\n' +
        '\t\t\t})',
    ],
  }
);
