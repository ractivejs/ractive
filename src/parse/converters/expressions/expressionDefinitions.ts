import TemplateItemType from 'config/types';

export interface SimpleTemplateItem {
  v: string | any;
}

export interface ValueTemplateItem {
  t:
    | TemplateItemType.STRING_LITERAL
    | TemplateItemType.NUMBER_LITERAL
    | TemplateItemType.BOOLEAN_LITERAL
    | TemplateItemType.REGEXP_LITERAL;
  v: string;
}

export interface GlobalValueTemplateItem {
  t: TemplateItemType.GLOBAL;
  v: string;
}

export interface ReferenceTemplateItem {
  t: TemplateItemType.REFERENCE;
  n: string;
  p?: boolean;
}

export interface MemberTemplateItem {
  t: TemplateItemType.MEMBER;
  x: PrimaryExpressionTemplateDefinition;
  r: RefinementTemplateItem;
}

export interface InvocationTemplateItem {
  t: TemplateItemType.INVOCATION;
  x: PrimaryExpressionTemplateDefinition;
  o?: ExpressionTemplateItem[];
  p?: boolean;
}

export interface BrackedTemplateItem {
  t: TemplateItemType.BRACKETED;
  x: ExpressionTemplateItem;
}

export interface InfixOperatorTemplateItem {
  t: TemplateItemType.INFIX_OPERATOR;
  s: string; // type of operation (e.g. +)

  // operators, the secondo element can be another InfixOperator
  o: [ValueTemplateItem, ValueTemplateItem | InfixOperatorTemplateItem];
}

export interface PrefixOperatorTemplateItem {
  t: TemplateItemType.PREFIX_OPERATOR;
  s: string;
  o: ExpressionTemplateItem;
}

export interface ConditionalOperatorTemplateItem {
  t: TemplateItemType.CONDITIONAL;

  /**
   * condition, if true expression, if false expression
   */
  o: [ExpressionTemplateItem, ExpressionTemplateItem, ExpressionTemplateItem]; // todo add correct type (related to readExpression)
}

export interface KeyValuePairTemplateItem {
  t: TemplateItemType.KEY_VALUE_PAIR;
  k: string;
  v: ExpressionTemplateItem;
  p?: boolean; // spread, v contains a spread syntax (...)
}

export interface ObjectLiteralTemplateItem {
  t: TemplateItemType.OBJECT_LITERAL;
  m: KeyValuePairTemplateItem[];
  p?: boolean; // spread, v contains a spread syntax (...)
}

export interface ArrayLiteralTemplateItem {
  t: TemplateItemType.ARRAY_LITERAL;
  m: ExpressionTemplateItem[]; // todo add correct type (related to readExpression)
  p?: boolean; // spread, v contains a spread syntax (...)
}

export interface RefinementTemplateItem {
  t: TemplateItemType.REFINEMENT;
  n?: string;
  x?: ExpressionTemplateItem;
}

// output of readExpression
export type ExpressionTemplateItem =
  | ValueTemplateItem
  | BrackedTemplateItem
  | ObjectLiteralTemplateItem
  | ArrayLiteralTemplateItem
  | ReferenceTemplateItem
  | GlobalValueTemplateItem
  | MemberTemplateItem
  | InvocationTemplateItem
  | PrefixOperatorTemplateItem
  | InfixOperatorTemplateItem
  | ConditionalOperatorTemplateItem

  // added this for flattenExpression. I don't think this is returned
  | RefinementTemplateItem;

// expression with spread support
export type ExpressionWithSpread =
  | ReferenceTemplateItem
  | InvocationTemplateItem
  | ArrayLiteralTemplateItem;

// define output of readPrimary
export type PrimaryExpressionTemplateDefinition =
  | ValueTemplateItem
  | BrackedTemplateItem
  | ObjectLiteralTemplateItem
  | ArrayLiteralTemplateItem
  | ReferenceTemplateItem
  | GlobalValueTemplateItem;

export type ExpressionWithValue = SimpleTemplateItem | ValueTemplateItem | GlobalValueTemplateItem;
