import TemplateElementType from 'config/types';

export interface LiteralTemplateElement {
  t: TemplateElementType.STRING_LITERAL | TemplateElementType.NUMBER_LITERAL;
  v: string;
}
