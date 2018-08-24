'use strict';

/*
 * This implementation is adapted from eslint-plugin-jasmine.
 * MIT license, Remco Haszing.
 */

const getDocsUrl = require('./util').getDocsUrl;

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    schema: [
      {
        type: 'object',
        properties: {
          assertFunctionNames: {
            type: 'array',
            items: [{ type: 'string' }],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    // variables should be defined here
    const unchecked = [];
    const assertFunctionNames =
      context.options[0] && context.options[0].assertFunctionNames
        ? context.options[0].assertFunctionNames
        : ['expect'];

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    const isExpectCall = node =>
      // if we're not calling a function, ignore
      node.type === 'CallExpression' &&
      // if we're not calling allowed assertion
      assertFunctionNames.some(name => name === node.callee.name);
    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      // give me methods
      CallExpression(node) {
        // keep track of `it` calls
        if (['it', 'test'].indexOf(node.callee.name) > -1) {
          unchecked.push(node);
          return;
        }
        if (!isExpectCall(node)) {
          return;
        }
        // here, we do have a call to expect
        // use `some` to return early (in case of nested `it`s
        context.getAncestors().some(ancestor => {
          const index = unchecked.indexOf(ancestor);
          if (index !== -1) {
            unchecked.splice(index, 1);
            return true;
          }
          return false;
        });
      },
      'Program:exit'() {
        unchecked.forEach(node =>
          context.report({
            message: 'Test has no assertions',
            node,
          })
        );
      },
    };
  },
};
