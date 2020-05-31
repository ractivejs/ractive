import TemplateItemType from 'config/types';

/**
 * This file contains all definition of abstract syntax for ractive template returned
 * by converters functions.
 * @todo change name to abstract something?
 *
 * @see https://github.com/ractivejs/template-spec
 *
 * @todo consider to add an enum to store key value
 *
 * t -> type
 * x -> expresion
 */

/** */
export interface TemplateModel {
  v: number;
  t: any[]; // add correct type after readTemplate conversion is complete
  p?: {
    [key: string]: any; // todo define type for partial
  };

  // expression storage
  e?: {
    [key: string]: ExpressionFunctionTemplateItem;
  };
}

// UTILS >>>

// function description on template model
// this in code is referred as expression but these word seems to include more than function
export interface ExpressionFunctionTemplateItem {
  // function name and if there are ny param dinamic names
  r: string[];

  // body of the function, includes also reference param
  // are that are replaced by _{index}
  s: string;
}

// UTILS <<<

// EXPRESSIONS >>>

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
}

// output of readExpression
export type ExpressionTemplateItem = any; // todo refine

export interface BrackedTemplateItem {
  t: TemplateItemType.BRACKETED;
  x: ExpressionTemplateItem;
}

export interface OperatorTemplateItem {
  t: TemplateItemType.INFIX_OPERATOR | TemplateItemType.PREFIX_OPERATOR;
  s: string; // type of peration (e.g. +)
  o: any[]; // operators
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
  p?: boolean; // spreak, v contains a spread syntax (...)
}

export interface ObjectLiteralTemplateItem {
  t: TemplateItemType.OBJECT_LITERAL;
  m: KeyValuePairTemplateItem[];
  p?: boolean; // spreak, v contains a spread syntax (...)
}

export interface ArrayLiteralTemplateItem {
  t: TemplateItemType.ARRAY_LITERAL;
  m: ExpressionTemplateItem[]; // todo add correct type (related to readExpression)
  p?: boolean; // spreak, v contains a spread syntax (...)
}

// define output of readLiteral
export type LiteralTemplateDefinition =
  | ValueTemplateItem
  | BrackedTemplateItem
  | ObjectLiteralTemplateItem
  | ArrayLiteralTemplateItem;

// define output of readPrimary
export type PrimaryExpressionTemplateDefinition =
  | ValueTemplateItem
  | BrackedTemplateItem
  | ObjectLiteralTemplateItem
  | ArrayLiteralTemplateItem
  | ReferenceTemplateItem
  | GlobalValueTemplateItem;

// EXPRESSIONS <<<

// ELEMENTS >>>

export interface CommentTemplateItem {
  t: TemplateItemType.COMMENT;
  c?: string; // content is available only for html comments
  q?: [number, number, number]; // line position
}

// ELEMENTS <<<
