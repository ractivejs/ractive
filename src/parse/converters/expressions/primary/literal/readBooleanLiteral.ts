import TemplateItemType from 'config/types';
import Parser from 'parse/Parser';
import { ValueTemplateItem } from 'parse/TemplateItems';

export default function readBooleanLiteral(parser: Parser): ValueTemplateItem {
  const remaining = parser.remaining();

  if (remaining.substr(0, 4) === 'true') {
    parser.pos += 4;
    return {
      t: TemplateItemType.BOOLEAN_LITERAL,
      v: 'true'
    };
  }

  if (remaining.substr(0, 5) === 'false') {
    parser.pos += 5;
    return {
      t: TemplateItemType.BOOLEAN_LITERAL,
      v: 'false'
    };
  }

  return null;
}
