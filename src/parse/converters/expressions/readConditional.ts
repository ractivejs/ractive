import TemplateItemType from 'config/types';
import type { StandardParser } from 'parse/_parse';
import type { ConditionalOperatorTemplateItem } from 'parse/converters/expressions/expressionDefinitions';

import readExpression from '../readExpression';

import readLogicalOr, { LogicalOrTypeofOrMemberOrInvocationOrPrimary } from './readLogicalOr';
import { expectedExpression } from './shared/errors';

export type ConditionalOrLogicalOrTypeofOrMemberOrInvocationOrPrimary =
  | LogicalOrTypeofOrMemberOrInvocationOrPrimary
  | ConditionalOperatorTemplateItem;

// The conditional operator is the lowest precedence operator, so we start here
export default function readConditional(
  parser: StandardParser
): ConditionalOrLogicalOrTypeofOrMemberOrInvocationOrPrimary {
  const expression = readLogicalOr(parser);
  if (!expression) {
    return null;
  }

  const start = parser.pos;

  parser.sp();

  if (!parser.matchString('?')) {
    parser.pos = start;
    return expression;
  }

  parser.sp();

  const ifTrue = readExpression(parser);
  if (!ifTrue) {
    parser.error(expectedExpression);
  }

  parser.sp();

  if (!parser.matchString(':')) {
    parser.error('Expected ":"');
  }

  parser.sp();

  const ifFalse = readExpression(parser);
  if (!ifFalse) {
    parser.error(expectedExpression);
  }

  return {
    t: TemplateItemType.CONDITIONAL,
    o: [expression, ifTrue, ifFalse]
  };
}
