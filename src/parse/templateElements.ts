import TemplateElementType from 'config/types';

/**
 * This file contains all definition of abstract syntax for ractive template returned
 * by converters functions.
 *
 * @todo change name to abstract something?
 */

export interface SimpleTemplateElement {
  v: string | any;
}

export interface ValueTemplateElement {
  t:
    | TemplateElementType.STRING_LITERAL
    | TemplateElementType.NUMBER_LITERAL
    | TemplateElementType.BOOLEAN_LITERAL
    | TemplateElementType.REGEXP_LITERAL
    | TemplateElementType.GLOBAL;
  v: string;
}

export interface ReferenceTemplateElement {
  t: TemplateElementType.REFERENCE;
  n: string;
}

export interface BrackedTemplateElement {
  t: TemplateElementType.BRACKETED;
  x: ReferenceTemplateElement;
}

export type TemplateDefinition =
  | SimpleTemplateElement
  | ValueTemplateElement
  | ReferenceTemplateElement
  | BrackedTemplateElement;
