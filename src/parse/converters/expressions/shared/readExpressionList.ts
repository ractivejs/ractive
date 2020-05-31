import { StandardParser } from 'parse/_parse';

import readExpression from '../../readExpression';
import { ExpressionTemplateItem, ExpressionWithSpread } from '../expressionDefinitions';

import { expectedExpression } from './errors';
import { spreadPattern } from './patterns';

export default function readExpressionList(
  parser: StandardParser,
  spread: boolean
): ExpressionTemplateItem[] {
  let isSpread;
  const expressions = [];

  const pos = parser.pos;

  do {
    parser.sp();

    if (spread) {
      isSpread = parser.matchPattern(spreadPattern);
    }

    const expr = readExpression(parser);

    if (expr === null && expressions.length) {
      parser.error(expectedExpression);
    } else if (expr === null) {
      parser.pos = pos;
      return null;
    }

    if (isSpread) {
      (expr as ExpressionWithSpread).p = true;
    }

    expressions.push(expr);

    parser.sp();
  } while (parser.matchString(','));

  return expressions;
}
