import TemplateItemType from 'config/types';
import { StandardParser } from 'parse/_parse';
import { ValueTemplateItem } from 'parse/converters/expressions/expressionDefinitions';

const regexpPattern = /^(\/(?:[^\n\r\u2028\u2029/\\[]|\\.|\[(?:[^\n\r\u2028\u2029\]\\]|\\.)*])+\/(?:([gimuy])(?![a-z]*\2))*(?![a-zA-Z_$0-9]))/;

export default function readNumberLiteral(parser: StandardParser): ValueTemplateItem {
  let result: string;

  if ((result = parser.matchPattern(regexpPattern))) {
    return {
      t: TemplateItemType.REGEXP_LITERAL,
      v: result
    };
  }

  return null;
}
