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
  t: TemplateItemDefinition[];
  p?: {
    [key: string]: any; // todo define type for partial
  };

  // expression storage
  e?: {
    [key: string]: ExpressionTempleteItem;
  };
}

export interface SimpleTemplateItem {
  v: string | any;
}

export interface ValueTemplateItem {
  t:
    | TemplateItemType.STRING_LITERAL
    | TemplateItemType.NUMBER_LITERAL
    | TemplateItemType.BOOLEAN_LITERAL
    | TemplateItemType.REGEXP_LITERAL
    | TemplateItemType.GLOBAL;
  v: string;
}

export interface ReferenceTemplateItem {
  t: TemplateItemType.REFERENCE;
  n: string;
}

export interface BrackedTemplateItem {
  t: TemplateItemType.BRACKETED;
  x: ReferenceTemplateItem | ExpressionTempleteItem | OperatorTemplateItem;
}

export interface ExpressionTempleteItem {
  // function name or param dinamic names
  r: string[];

  // body of the function, includes also reference param
  // are that are replaced by _{index}
  s: string;
}

export interface OperatorTemplateItem {
  t: TemplateItemType.INFIX_OPERATOR | TemplateItemType.PREFIX_OPERATOR;
  s: string; // type of peration (e.g. +)
  o: any[]; // operators
}

export interface CommentTemplateItem {
  t: TemplateItemType.COMMENT;
  c?: string; // content is available only for html comments
  q?: [number, number, number]; // line position
}

export interface KeyValuePairTemplateItem {
  t: TemplateItemType.KEY_VALUE_PAIR;
  k: string;
  v: ReferenceTemplateItem | ExpressionTempleteItem;
  p?: boolean; // spreak, v contains a spread syntax (...)
}

export interface ObjectLiteralTemplateItem {
  t: TemplateItemType.OBJECT_LITERAL;
  m: KeyValuePairTemplateItem[];
}

export type TemplateItemDefinition =
  | SimpleTemplateItem
  | ValueTemplateItem
  | ReferenceTemplateItem
  | BrackedTemplateItem
  | ExpressionTempleteItem
  | CommentTemplateItem;
