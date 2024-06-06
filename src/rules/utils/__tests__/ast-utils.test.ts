import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  areTokensOnSameLine,
  isTokenASemicolon,
  isValidParent,
} from '../ast-utils';

describe('isValidParent', () => {
  test.each`
    type                              | expected
    ${AST_NODE_TYPES.Program}         | ${true}
    ${AST_NODE_TYPES.BlockStatement}  | ${true}
    ${AST_NODE_TYPES.SwitchCase}      | ${true}
    ${AST_NODE_TYPES.SwitchStatement} | ${true}
    ${AST_NODE_TYPES.Identifier}      | ${false}
  `('returns $expected for parent value of $type', ({ type, expected }) => {
    expect(isValidParent(type)).toBe(expected);
  });
});

describe('isTokenASemicolon', () => {
  test.each`
    type                          | value  | expected
    ${AST_TOKEN_TYPES.Punctuator} | ${';'} | ${true}
    ${AST_TOKEN_TYPES.Punctuator} | ${'.'} | ${false}
    ${AST_TOKEN_TYPES.String}     | ${';'} | ${false}
  `('returns $expected for $type and $value', ({ type, value, expected }) => {
    const token: TSESTree.Token = {
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
  const makeNode = (line: number): TSESTree.Node => {
    return {
      type: AST_NODE_TYPES.Identifier,
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
    } as TSESTree.Node;
  };

  const makeToken = (line: number): TSESTree.Token => {
    return {
      type: AST_TOKEN_TYPES.Punctuator,
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
