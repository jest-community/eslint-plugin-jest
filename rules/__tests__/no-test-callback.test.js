'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../no-test-callback');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
});

ruleTester.run('no-test-callback', rule, {
  valid: [
    'test("something", () => {})',
    'test("something", function() {})',
    'test("something", function () {})',
  ],
  invalid: [
    {
      code: 'test("something", done => {done();})',
      errors: [
        {
          message: 'Illegal usage of test callback',
          line: 1,
          column: 19,
        },
      ],
      output:
        'test("something", () => {return new Promise(done => {done();})})',
    },
    {
      code: 'test("something", (done) => {done();})',
      errors: [
        {
          message: 'Illegal usage of test callback',
          line: 1,
          column: 20,
        },
      ],
      output:
        'test("something", () => {return new Promise((done) => {done();})})',
    },
    {
      code: 'test("something", done => done())',
      errors: [
        {
          message: 'Illegal usage of test callback',
          line: 1,
          column: 19,
        },
      ],
      output: 'test("something", () => new Promise(done => done()))',
    },
    {
      code: 'test("something", (done) => done())',
      errors: [
        {
          message: 'Illegal usage of test callback',
          line: 1,
          column: 20,
        },
      ],
      output: 'test("something", () => new Promise((done) => done()))',
    },
    {
      code: 'test("something", function(done) {done();})',
      errors: [
        {
          message: 'Illegal usage of test callback',
          line: 1,
          column: 28,
        },
      ],
      output:
        'test("something", function() {return new Promise((done) => {done();})})',
    },
    {
      code: 'test("something", function (done) {done();})',
      errors: [
        {
          message: 'Illegal usage of test callback',
          line: 1,
          column: 29,
        },
      ],
      output:
        'test("something", function () {return new Promise((done) => {done();})})',
    },
  ],
});
