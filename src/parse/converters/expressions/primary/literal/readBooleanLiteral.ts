import TemplateElementType from 'config/types';
import Parser from 'parse/Parser';
import { LiteralTemplateElement } from 'parse/templateElements';

export default function readBooleanLiteral(parser: Parser): LiteralTemplateElement {
  const remaining = parser.remaining();

  if (remaining.substr(0, 4) === 'true') {
    parser.pos += 4;
    return {
      t: TemplateElementType.BOOLEAN_LITERAL,
      v: 'true'
    };
  }

  if (remaining.substr(0, 5) === 'false') {
    parser.pos += 5;
    return {
      t: TemplateElementType.BOOLEAN_LITERAL,
      v: 'false'
    };
  }

  return null;
}
