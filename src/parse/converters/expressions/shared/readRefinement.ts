import { REFINEMENT } from 'config/types';
import { StandardParser } from 'parse/_parse';
import { RefinementTemplateItem } from 'parse/converters/expressions/expressionDefinitions';
import readExpression from 'parse/converters/readExpression';

import { expectedExpression } from './errors';
import { name as namePattern } from './patterns';

export default function readRefinement(parser: StandardParser): RefinementTemplateItem {
  // some things call for strict refinement (partial names), meaning no space between reference and refinement
  if (!parser.strictRefinement) {
    parser.sp();
  }

  // "." name
  if (parser.matchString('.')) {
    parser.sp();

    const name = parser.matchPattern(namePattern);
    if (name) {
      return {
        t: REFINEMENT,
        n: name
      };
    }

    parser.error('Expected a property name');
  }

  // "[" expression "]"
  if (parser.matchString('[')) {
    parser.sp();

    const expr = readExpression(parser);
    if (!expr) parser.error(expectedExpression);

    parser.sp();

    if (!parser.matchString(']')) parser.error(`Expected ']'`);

    return {
      t: REFINEMENT,
      x: expr
    };
  }

  return null;
}
