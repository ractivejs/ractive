import { CONDITIONAL } from 'config/types';
import readLogicalOr, { LogicalOrTypeofOrMemberOrInvocationOrPrimary } from './readLogicalOr';
import { expectedExpression } from './shared/errors';
import readExpression from '../readExpression';
import { ConditionalOperatorTemplateItem } from 'parse/converters/expressions/expressionDefinitions';
import { StandardParser } from 'parse/_parse';

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
    t: CONDITIONAL,
    o: [expression, ifTrue, ifFalse]
  };
}
