import TemplateItemType from 'config/types';
import { StandardParser } from 'parse/_parse';
import { BrackedTemplateItem } from 'parse/converters/expressions/expressionDefinitions';
import readExpression from 'parse/converters/readExpression';

import { expectedExpression, expectedParen } from '../shared/errors';

export default function readBracketedExpression(parser: StandardParser): BrackedTemplateItem {
  if (!parser.matchString('(')) return null;

  parser.sp();

  const expr = readExpression(parser);

  if (!expr) parser.error(expectedExpression);

  parser.sp();

  if (!parser.matchString(')')) parser.error(expectedParen);

  return {
    t: TemplateItemType.BRACKETED,
    x: expr
  };
}
