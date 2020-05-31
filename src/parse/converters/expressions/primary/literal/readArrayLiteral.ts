import { ARRAY_LITERAL } from 'src/config/types';
import readExpressionList from '../../shared/readExpressionList';
import { StandardParser } from 'parse/_parse';
import { ArrayLiteralTemplateItem } from 'parse/TemplateItems';

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
