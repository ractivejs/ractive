import readConditional from './expressions/readConditional';
import readReference from './expressions/primary/readReference';
import { StandardParser } from 'parse/_parse';
import { ExpressionTemplateItem } from './expressions/expressionDefinitions';

export default function readExpression(parser: StandardParser): ExpressionTemplateItem {
  // if eval is false, no expressions
  if (parser.allowExpressions === false) {
    const ref = readReference(parser);
    parser.sp();
    return ref;
  }

  /**
   * @todo consider to remove move inside one place all logic for sequence matcher
   *  inside readType and readLogicalOr
   */

  // The conditional operator is the lowest precedence operator (except yield,
  // assignment operators, and commas, none of which are supported), so we
  // start there. If it doesn't match, it 'falls through' to progressively
  // higher precedence operators, until it eventually matches (or fails to
  // match) a 'primary' - a literal or a reference. This way, the abstract syntax
  // tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
  return readConditional(parser);
}
