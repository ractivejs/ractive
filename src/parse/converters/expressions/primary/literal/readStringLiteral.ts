import makeQuotedStringMatcher from './stringLiteral/makeQuotedStringMatcher';
import TemplateItemType from 'config/types';
import { ValueTemplateItem } from 'parse/TemplateItems';
import Parser from 'parse/Parser';

const singleMatcher = makeQuotedStringMatcher(`"`);
const doubleMatcher = makeQuotedStringMatcher(`'`);

export default function(parser: Parser): ValueTemplateItem {
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
