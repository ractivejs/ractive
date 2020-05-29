import TemplateElementType from 'config/types';
import { LiteralTemplateElement } from 'parse/templateElements';
import Parser from 'parse/Parser';

const regexpPattern = /^(\/(?:[^\n\r\u2028\u2029/\\[]|\\.|\[(?:[^\n\r\u2028\u2029\]\\]|\\.)*])+\/(?:([gimuy])(?![a-z]*\2))*(?![a-zA-Z_$0-9]))/;

export default function readNumberLiteral(parser: Parser): LiteralTemplateElement {
  let result: string;

  if ((result = parser.matchPattern(regexpPattern))) {
    return {
      t: TemplateElementType.REGEXP_LITERAL,
      v: result
    };
  }

  return null;
}
