import TemplateItemType from 'config/types';
import type { ValueTemplateItem } from 'parse/converters/expressions/expressionDefinitions';
import type Parser from 'parse/Parser';

import makeQuotedStringMatcher from './stringLiteral/makeQuotedStringMatcher';

const singleMatcher = makeQuotedStringMatcher(`"`);
const doubleMatcher = makeQuotedStringMatcher(`'`);

export default function (parser: Parser): ValueTemplateItem {
  const start = parser.pos;
  const quote = parser.matchString(`'`) || parser.matchString(`"`);

  if (quote) {
    const string = (quote === `'` ? singleMatcher : doubleMatcher)(parser);

    if (!parser.matchString(quote)) {
      parser.pos = start;
      return null;
    }

    return {
      t: TemplateItemType.STRING_LITERAL,
      v: string
    };
  }

  return null;
}
