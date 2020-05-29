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

export interface LiteralTemplateElement {
  t: TemplateElementType.STRING_LITERAL | TemplateElementType.NUMBER_LITERAL;
  v: string;
}

export type TemplateDefinition = SimpleTemplateElement | LiteralTemplateElement;
