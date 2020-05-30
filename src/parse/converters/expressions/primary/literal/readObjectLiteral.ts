import readKeyValuePairs from './objectLiteral/keyValuePairs';
import TemplateItemType from 'config/types';
import { ObjectLiteralTemplateItem } from 'parse/TemplateItems';
import { StandardParser } from 'parse/_parse';

export default function(parser: StandardParser): ObjectLiteralTemplateItem {
  const start = parser.pos;

  // allow whitespace
  parser.sp();

  if (!parser.matchString('{')) {
    parser.pos = start;
    return null;
  }

  const keyValuePairs = readKeyValuePairs(parser);

  // allow whitespace between final value and '}'
  parser.sp();

  if (!parser.matchString('}')) {
    parser.pos = start;
    return null;
  }

  return {
    t: TemplateItemType.OBJECT_LITERAL,
    m: keyValuePairs
  };
}
