import TemplateItemType from 'config/types';

/**
 * This file contains all definition of abstract syntax for ractive template returned
 * by converters functions.
 * @todo change name to abstract something?
 *
 * @see https://github.com/ractivejs/template-spec
 *
 * @see {@link src/parse/converters/expressions/expressionDefinitions}
 *
 * @todo consider to add an enum to store key value
 *
 * t -> type
 * x -> expression
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

  // return the related function definition based on `r` and `s` properties
  e?: Function;
}

// UTILS <<<

// ELEMENTS >>>

export interface CommentTemplateItem {
  t: TemplateItemType.COMMENT;
  c?: string; // content is available only for html comments
  q?: [number, number, number]; // line position
}

// ELEMENTS <<<
