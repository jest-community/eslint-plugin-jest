'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../..').rules;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
});

const expectedMsg =
  'Promise should be returned to test its fulfillment or rejection';

ruleTester.run('valid-expect-in-promise', rules['valid-expect-in-promise'], {
  invalid: [
    {
      code:
        'it("it1", () => { somePromise.then(' +
        '() => {expect(someThing).toEqual(true)})})',
      errors: [
        {
          column: 19,
          endColumn: 76,
          message: expectedMsg,
        },
      ],
    },
    {
      code:
        'it("it1", function() { getSomeThing().getPromise().then(' +
        'function() {expect(someThing).toEqual(true)})})',
      errors: [
        {
          column: 24,
          endColumn: 102,
          message: expectedMsg,
        },
      ],
    },
    {
      code:
        'it("it1", function() { Promise.resolve().then(' +
        'function() {expect(someThing).toEqual(true)})})',
      errors: [
        {
          column: 24,
          endColumn: 92,
          message: expectedMsg,
        },
      ],
    },
    {
      code:
        'it("it1", function() { somePromise.catch(' +
        'function() {expect(someThing).toEqual(true)})})',
      errors: [
        {
          column: 24,
          endColumn: 87,
          message: expectedMsg,
        },
      ],
    },
    {
      code:
        'it("it1", function() { somePromise.then(' +
        'function() { expect(someThing).toEqual(true)})})',
      errors: [
        {
          column: 24,
          endColumn: 87,
          message: expectedMsg,
        },
      ],
    },
    {
      code:
        'it("it1", function() { Promise.resolve().then(' +
        'function() { /*fulfillment*/ expect(someThing).toEqual(true)}, ' +
        'function() { /*rejection*/ expect(someThing).toEqual(true)})})',
      errors: [
        {
          column: 24,
          endColumn: 170,
          message: expectedMsg,
        },
        {
          column: 24,
          endColumn: 170,
          message: expectedMsg,
        },
      ],
    },
    {
      code:
        'it("it1", function() { Promise.resolve().then(' +
        'function() { /*fulfillment*/}, ' +
        'function() { /*rejection*/ expect(someThing).toEqual(true)})})',
      errors: [
        {
          column: 24,
          endColumn: 138,
          message: expectedMsg,
        },
      ],
    },
  ],

  valid: [
    'it("it1", () => { return somePromise.then(() => {expect(someThing).toEqual(true)})})',

    'it("it1", function() { return somePromise.catch(' +
      'function() {expect(someThing).toEqual(true)})})',

    'it("it1", function() { somePromise.then(' +
      'function() {doSomeThingButNotExpect()})})',

    'it("it1", function() { return getSomeThing().getPromise().then(' +
      'function() {expect(someThing).toEqual(true)})})',

    'it("it1", function() { return Promise.resolve().then(' +
      'function() {expect(someThing).toEqual(true)})})',

    'it("it1", function() { return Promise.resolve().then(' +
      'function() { /*fulfillment*/ expect(someThing).toEqual(true)}, ' +
      'function() { /*rejection*/ expect(someThing).toEqual(true)})})',

    'it("it1", function() { return Promise.resolve().then(' +
      'function() { /*fulfillment*/}, ' +
      'function() { /*rejection*/ expect(someThing).toEqual(true)})})',

    'it("it1", function() { return somePromise.then()})',

    'it("it1", async () => { await Promise.resolve().then(' +
      'function() {expect(someThing).toEqual(true)})})',

    'it("it1", async () => ' +
      '{ await somePromise.then(() => {expect(someThing).toEqual(true)})})',

    'it("it1", async () => { await getSomeThing().getPromise().then(' +
      'function() {expect(someThing).toEqual(true)})})',
  ],
});
