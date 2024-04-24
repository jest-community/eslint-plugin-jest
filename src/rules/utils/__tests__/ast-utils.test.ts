import type { AST } from 'eslint';
import type { Node } from 'estree';
import {
  areTokensOnSameLine,
  isTokenASemicolon,
  isValidParent,
} from '../ast-utils';

describe('isValidParent', () => {
  test.each`
    type                 | expected
    ${'Program'}         | ${true}
    ${'BlockStatement'}  | ${true}
    ${'SwitchCase'}      | ${true}
    ${'SwitchStatement'} | ${true}
    ${'Statement'}       | ${false}
  `('returns $expected for parent value of $type', ({ type, expected }) => {
    expect(isValidParent(type)).toBe(expected);
  });
});

describe('isTokenASemicolon', () => {
  test.each`
    type            | value  | expected
    ${'Punctuator'} | ${';'} | ${true}
    ${'Punctuator'} | ${'.'} | ${false}
    ${'String'}     | ${';'} | ${false}
  `('returns $expected for $type and $value', ({ type, value, expected }) => {
    const token: AST.Token = {
      type,
      value,
      range: [0, 1],
      loc: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 1,
        },
      },
    };

    expect(isTokenASemicolon(token)).toBe(expected);
  });
});

describe('areTokensOnSameLine', () => {
  const makeNode = (line: number): Node => {
    return {
      type: 'Identifier',
      name: 'describe',
      loc: {
        start: {
          line,
          column: 10,
        },
        end: {
          line,
          column: 10,
        },
      },
    };
  };

  const makeToken = (line: number): AST.Token => {
    return {
      type: 'Punctuator',
      value: ';',
      range: [0, 1],
      loc: {
        start: {
          line,
          column: 10,
        },
        end: {
          line,
          column: 10,
        },
      },
    };
  };

  test.each`
    left            | right           | expected
    ${makeNode(1)}  | ${makeNode(1)}  | ${true}
    ${makeNode(1)}  | ${makeToken(1)} | ${true}
    ${makeToken(1)} | ${makeNode(1)}  | ${true}
    ${makeToken(1)} | ${makeToken(1)} | ${true}
    ${makeNode(1)}  | ${makeNode(2)}  | ${false}
    ${makeNode(1)}  | ${makeToken(2)} | ${false}
    ${makeToken(1)} | ${makeNode(2)}  | ${false}
    ${makeToken(1)} | ${makeToken(2)} | ${false}
  `(
    'returns $expected for left node/token ending on $left.loc.end.line and right node/token starting on $right.loc.start.line',
    ({ left, right, expected }) => {
      expect(areTokensOnSameLine(left, right)).toBe(expected);
    },
  );
});
