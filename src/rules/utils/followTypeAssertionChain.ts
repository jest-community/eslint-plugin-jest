import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

export type MaybeTypeCast<Expression extends TSESTree.Expression> =
  | TSTypeCastExpression<Expression>
  | Expression;

type TSTypeCastExpression<
  Expression extends TSESTree.Expression = TSESTree.Expression,
> = AsExpressionChain<Expression> | TypeAssertionChain<Expression>;

interface AsExpressionChain<
  Expression extends TSESTree.Expression = TSESTree.Expression,
> extends TSESTree.TSAsExpression {
  expression: AsExpressionChain<Expression> | Expression;
}

interface TypeAssertionChain<
  Expression extends TSESTree.Expression = TSESTree.Expression,
> extends TSESTree.TSTypeAssertion {
  expression: TypeAssertionChain<Expression> | Expression;
}

const isTypeCastExpression = <Expression extends TSESTree.Expression>(
  node: MaybeTypeCast<Expression>,
): node is TSTypeCastExpression<Expression> =>
  node.type === AST_NODE_TYPES.TSAsExpression ||
  node.type === AST_NODE_TYPES.TSTypeAssertion;

export const followTypeAssertionChain = <
  Expression extends TSESTree.Expression,
>(
  expression: MaybeTypeCast<Expression>,
): Expression =>
  isTypeCastExpression(expression)
    ? followTypeAssertionChain(expression.expression)
    : expression;
