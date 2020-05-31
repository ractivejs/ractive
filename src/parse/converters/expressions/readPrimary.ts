import readLiteral from './primary/readLiteral';
import readReference from './primary/readReference';
import readBracketedExpression from './primary/readBracketedExpression';
import { PrimaryExpressionTemplateDefinition } from 'parse/converters/expressions/expressionDefinitions';
import { StandardParser } from 'parse/_parse';

export default function readPrimary(parser: StandardParser): PrimaryExpressionTemplateDefinition {
  return readLiteral(parser) || readReference(parser) || readBracketedExpression(parser);
}
