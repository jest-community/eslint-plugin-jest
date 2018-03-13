'use strict';

const espree = require('espree');
const estraverse = require('estraverse');
const parseExpect = require('../parse-expect');

const CASES = {
  notExpect(parsed) {
    expect(parsed).toBeNull();
  },
  'expect()'(parsed) {
    expect(parsed).toMatchObject({
      arguments: [],
      properties: [],
      matcher: undefined,
      matcherArguments: [],
    });
  },
  'expect().toBe'(parsed) {
    expect(parsed).toMatchObject({
      arguments: [],
      properties: [Identifier('toBe')],
      matcher: undefined,
      matcherArguments: [],
    });
  },
  'expect().toBe()'(parsed) {
    expect(parsed).toMatchObject({
      arguments: [],
      properties: [],
      matcher: Identifier('toBe'),
      matcherArguments: [],
    });
  },
  'expect(Promise.resolve(2)).not.resolves.toEqual(3)'(parsed) {
    expect(parsed).toMatchObject({
      arguments: [
        CallExpression(Identifier('Promise'), Identifier('resolve'), [
          Literal(2),
        ]),
      ],
      properties: [Identifier('not'), Identifier('resolves')],
      matcher: Identifier('toEqual'),
      matcherArguments: [Literal(3)],
    });
  },
  'expect().a.b.c.d.e.f()'(parsed) {
    expect(parsed).toMatchObject({
      arguments: [],
      properties: [
        Identifier('a'),
        Identifier('b'),
        Identifier('c'),
        Identifier('d'),
        Identifier('e'),
      ],
      matcher: Identifier('f'),
      matcherArguments: [],
    });
  },
};

Object.keys(CASES).forEach(code => {
  test(code, () => {
    const assertion = CASES[code];
    const node = findExpect(code);
    assertion(parseExpect(node));
  });
});

function findExpect(code) {
  let callExpression = null;

  const ast = espree.parse(code);
  estraverse.traverse(ast, {
    enter(node, parent) {
      node.parent = parent;
      if (
        !callExpression &&
        node.type === 'CallExpression' &&
        node.callee.name === 'expect'
      ) {
        callExpression = node;
      }
    },
  });

  return callExpression;
}

function Identifier(name) {
  return {
    type: 'Identifier',
    name,
  };
}

function Literal(value) {
  return {
    type: 'Literal',
    value,
  };
}

function CallExpression(object, property, args) {
  return {
    type: 'CallExpression',
    callee: {
      object,
      property,
    },
    arguments: args || [],
  };
}
