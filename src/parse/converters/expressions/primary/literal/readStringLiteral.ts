import makeQuotedStringMatcher from './stringLiteral/makeQuotedStringMatcher';
import TemplateElementType from 'config/types';
import { LiteralTemplateElement } from 'parse/templateElements';
import Parser from 'parse/Parser';

const singleMatcher = makeQuotedStringMatcher(`"`);
const doubleMatcher = makeQuotedStringMatcher(`'`);

export default function(parser: Parser): LiteralTemplateElement {
  const start = parser.pos;
  const quote = parser.matchString(`'`) || parser.matchString(`"`);

  if (quote) {
    const string = (quote === `'` ? singleMatcher : doubleMatcher)(parser);

    if (!parser.matchString(quote)) {
      parser.pos = start;
      return null;
    }

    return {
      t: TemplateElementType.STRING_LITERAL,
      v: string
    };
  }

  return null;
}
