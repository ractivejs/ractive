import { StandardParser } from 'parse/_parse';
import { ARRAY_LITERAL } from 'src/config/types';

import { ArrayLiteralTemplateItem } from '../../expressionDefinitions';
import readExpressionList from '../../shared/readExpressionList';

export default function(parser: StandardParser): ArrayLiteralTemplateItem {
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
    t: ARRAY_LITERAL,
    m: expressionList
  };
}
