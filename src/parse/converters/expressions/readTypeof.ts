import TemplateItemType from 'config/types';
import { expectedExpression } from './shared/errors';
import readMemberOrInvocation from './readMemberOrInvocation';
import readExpression from '../readExpression';
import { StandardParser } from 'parse/_parse';
import { PrefixOperatorTemplateItem } from 'parse/TemplateItems';

let readTypeOf: ReadTypeOfConverter;

type ReadTypeOfConverter = (parser: StandardParser) => PrefixOperatorTemplateItem;

const makePrefixSequenceMatcher = function(
  symbol: string,
  fallthrough: ReadTypeOfConverter
): ReadTypeOfConverter {
  return function(parser: StandardParser) {
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
  } as ReadTypeOfConverter;
};

// create all prefix sequence matchers, return readTypeOf
(function() {
  let i, len, matcher, fallthrough;

  const prefixOperators = '! ~ + - typeof'.split(' ');

  fallthrough = readMemberOrInvocation;
  for (i = 0, len = prefixOperators.length; i < len; i += 1) {
    matcher = makePrefixSequenceMatcher(prefixOperators[i], fallthrough);
    fallthrough = matcher;
  }

  // typeof operator is higher precedence than multiplication, so provides the
  // fallthrough for the multiplication sequence matcher we're about to create
  // (we're skipping void and delete)
  readTypeOf = fallthrough;
})();

export default readTypeOf;
