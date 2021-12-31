import { TSESTree } from '@typescript-eslint/experimental-utils';
import {
  DescribeAlias,
  DescribeProperty,
  HookName,
  TestCaseName,
  TestCaseProperty,
} from './enums';
import { KnownIdentifier, KnownMemberExpression } from './misc';

export type JestFunctionName = DescribeAlias | TestCaseName | HookName;
export type JestPropertyName = DescribeProperty | TestCaseProperty;

export interface JestFunctionIdentifier<FunctionName extends JestFunctionName>
  extends TSESTree.Identifier {
  name: FunctionName;
}

export interface JestFunctionMemberExpression<
  FunctionName extends JestFunctionName,
  PropertyName extends JestPropertyName = JestPropertyName,
> extends KnownMemberExpression<PropertyName> {
  object: JestFunctionIdentifier<FunctionName>;
}

export interface JestFunctionCallExpressionWithMemberExpressionCallee<
  FunctionName extends JestFunctionName,
  PropertyName extends JestPropertyName = JestPropertyName,
> extends TSESTree.CallExpression {
  callee: JestFunctionMemberExpression<FunctionName, PropertyName>;
}

export interface JestFunctionCallExpressionWithIdentifierCallee<
  FunctionName extends JestFunctionName,
> extends TSESTree.CallExpression {
  callee: JestFunctionIdentifier<FunctionName>;
}

interface JestEachMemberExpression<
  TName extends Exclude<JestFunctionName, HookName>,
> extends KnownMemberExpression<'each'> {
  object:
    | KnownIdentifier<TName>
    | (KnownMemberExpression & { object: KnownIdentifier<TName> });
}

export interface JestCalledEachCallExpression<
  TName extends Exclude<JestFunctionName, HookName>,
> extends TSESTree.CallExpression {
  callee: TSESTree.CallExpression & {
    callee: JestEachMemberExpression<TName>;
  };
}

export interface JestTaggedEachCallExpression<
  TName extends Exclude<JestFunctionName, HookName>,
> extends TSESTree.CallExpression {
  callee: TSESTree.TaggedTemplateExpression & {
    tag: JestEachMemberExpression<TName>;
  };
}

type JestEachCallExpression<TName extends Exclude<JestFunctionName, HookName>> =
  JestCalledEachCallExpression<TName> | JestTaggedEachCallExpression<TName>;

export type JestFunctionCallExpression<
  FunctionName extends Exclude<JestFunctionName, HookName> = Exclude<
    JestFunctionName,
    HookName
  >,
> =
  | JestEachCallExpression<FunctionName>
  | JestFunctionCallExpressionWithMemberExpressionCallee<FunctionName>
  | JestFunctionCallExpressionWithIdentifierCallee<FunctionName>;
