import TemplateItemType from 'config/types';
import { LinePosition } from 'parse/Parser';

import {
  GenericAttributeTemplateItem,
  TransitionDirectiveTemplateItem,
  DecoratorDirectiveTemplateItem,
  EventDirectiveTemplateItem,
  AttributesOrDirectiveTemplateItem
} from './element/elementDefinitions';
import { FragmentTemplateItem, MustachePrimaryItem } from './mustache/mustacheDefinitions';

// todo replace occurrences of string where it makes sense
export type TextTemplateItem = string;

export interface PartialRegistryTemplateItem {
  [key: string]: FragmentTemplateItem[];
}

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
  t: (
    | MustachePrimaryItem
    | AttributesOrDirectiveTemplateItem
    | ElementTemplateItem
    | CommentTemplateItem
    | string
  )[]; // add correct type after readTemplate conversion is complete

  p?: PartialRegistryTemplateItem;

  // expression storage
  e?: {
    [key: string]: ExpressionFunctionTemplateItem;
  };
}

/**
 * function description on template model
 * this in code is referred as expression but these word seems to include more than function
 */
export interface ExpressionFunctionTemplateItem {
  /** function name and if there are ny param dinamic names  */
  r: string[];

  /**
   * body of the function, includes also reference param
   * are that are replaced by _{index}
   */
  s: string;

  /** return the related function definition based on `r` and `s` properties */
  e?: Function;
}

export interface InlinePartialDefinitionTemplateItem {
  t: TemplateItemType.INLINE_PARTIAL;

  /** Partial name */
  n: string;

  f: FragmentTemplateItem[];
}

export interface ElementTemplateItem {
  t: TemplateItemType.ELEMENT;

  /**
   * Element name
   * @example `div`
   * @example `input`
   */
  e: string;

  /**
   * Atrributes on the element
   */
  m: (
    | GenericAttributeTemplateItem
    | TransitionDirectiveTemplateItem
    | DecoratorDirectiveTemplateItem
    | EventDirectiveTemplateItem
  )[];

  /**
   * Content of the element
   */
  f: (string | ElementTemplateItem)[];

  p?: PartialRegistryTemplateItem;

  /** include line positon data */
  q?: LinePosition;
}

export interface DoctypeTemplateItem {
  t: TemplateItemType.DOCTYPE;

  /** Doctype value */
  a: string;

  /** include line positon data */
  q?: LinePosition;
}

export interface AnchorTemplateItem {
  t: TemplateItemType.ANCHOR;

  /** anchor name */
  n: string;
}

export type PrimaryElementTemplateItem = ElementTemplateItem | DoctypeTemplateItem;

export interface CommentTemplateItem {
  t: TemplateItemType.COMMENT;

  /** content is available only for html comments */
  c?: string;

  q?: LinePosition;
}
