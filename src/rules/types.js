// @flow

type Location = {
  column: number,
  line: number,
};

type NodeLocation = {
  end: Location,
  start: Location,
};

type ParentNode = CallExpression | MemberExpression;

export type Node = CallExpression | MemberExpression | Identifier | Literal;

export type Identifier = {
  type: 'Identifier',
  name: string,
  value: string,
  parent: ParentNode,
  loc: NodeLocation,
};

export type MemberExpression = {
  type: 'MemberExpression',
  name: string,
  expression: CallExpression,
  property: Identifier,
  object: Identifier,
  parent: ParentNode,
  loc: NodeLocation,
};

export type Literal = {
  type: 'Literal',
  value?: string,
  rawValue?: string,
  parent: ParentNode,
  property: Identifier,
  object: Identifier,
  loc: NodeLocation,
};

export type CallExpression = {
  type: 'CallExpression',
  arguments: Array<Literal>,
  callee: Identifier | MemberExpression,
  parent: ParentNode,
  loc: NodeLocation,
};

export type EslintContext = {|
  report: ({ loc?: NodeLocation, message: string, node: any }) => void,
|};
