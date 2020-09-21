import TemplateItemType from 'config/types';
import type { StandardParser } from 'parse/_parse';

import type { ArrayLiteralTemplateItem } from '../../expressionDefinitions';
import readExpressionList from '../../shared/readExpressionList';

export default function (parser: StandardParser): ArrayLiteralTemplateItem {
  const start = parser.pos;

  // allow whitespace before '['
  parser.sp();

  if (!parser.matchString('[')) {
    parser.pos = start;
    return null;
  }

  const expressionList = readExpressionList(parser, true);

  if (!parser.matchString(']')) {
    parser.pos = start;
    return null;
  }

  return {
    t: TemplateItemType.ARRAY_LITERAL,
    m: expressionList
  };
}
