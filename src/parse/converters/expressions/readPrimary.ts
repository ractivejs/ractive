import type { StandardParser } from 'parse/_parse';
import type { PrimaryExpressionTemplateDefinition } from 'parse/converters/expressions/expressionDefinitions';

import readBracketedExpression from './primary/readBracketedExpression';
import readLiteral from './primary/readLiteral';
import readReference from './primary/readReference';

export default function readPrimary(parser: StandardParser): PrimaryExpressionTemplateDefinition {
  return readLiteral(parser) || readReference(parser) || readBracketedExpression(parser);
}
