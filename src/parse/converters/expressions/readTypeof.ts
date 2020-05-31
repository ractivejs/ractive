import TemplateItemType from 'config/types';
import { expectedExpression } from './shared/errors';
import readMemberOrInvocation, { MemberOrInvocationOrPrimary } from './readMemberOrInvocation';
import readExpression from '../readExpression';
import { StandardParser } from 'parse/_parse';
import { PrefixOperatorTemplateItem } from 'parse/converters/expressions/expressionDefinitions';

/**
 * Includes template item reutorn by this module and readMemberOrInvocation
 */
export type TypeofOrMemberOrInvocationOrPrimary =
  | MemberOrInvocationOrPrimary
  | PrefixOperatorTemplateItem;

type ReadTypeOfConverter = (parser: StandardParser) => TypeofOrMemberOrInvocationOrPrimary;

let readTypeOf: ReadTypeOfConverter;

const makePrefixSequenceMatcher = function(
  symbol: string,
  fallthrough: ReadTypeOfConverter
): ReadTypeOfConverter {
  return function(parser: StandardParser): TypeofOrMemberOrInvocationOrPrimary {
    let expression;

    if ((expression = fallthrough(parser))) {
      return expression;
    }

    if (!parser.matchString(symbol)) {
      return null;
    }

    parser.sp();

    expression = readExpression(parser);
    if (!expression) {
      parser.error(expectedExpression);
    }

    return {
      t: TemplateItemType.PREFIX_OPERATOR,
      s: symbol,
      o: expression
    };
  };
};

// create all prefix sequence matchers, return readTypeOf
{
  let i: number, len: number, matcher: ReadTypeOfConverter;

  const prefixOperators = '! ~ + - typeof'.split(' ');

  let fallthrough: ReadTypeOfConverter = readMemberOrInvocation;
  for (i = 0, len = prefixOperators.length; i < len; i += 1) {
    matcher = makePrefixSequenceMatcher(prefixOperators[i], fallthrough);
    fallthrough = matcher;
  }

  // typeof operator is higher precedence than multiplication, so provides the
  // fallthrough for the multiplication sequence matcher we're about to create
  // (we're skipping void and delete)
  readTypeOf = fallthrough;
}

export default readTypeOf;
