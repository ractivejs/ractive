import TemplateElementType from 'config/types';
import { LiteralTemplateElement } from 'parse/templateElements';

// bulletproof number regex from https://gist.github.com/Rich-Harris/7544330
const numberPattern = /^(?:[+-]?)0*(?:(?:(?:[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;

// todo add correct type on Parser
export default function readNumberLiteral(parser): LiteralTemplateElement {
  let result;

  if ((result = parser.matchPattern(numberPattern))) {
    return {
      t: TemplateElementType.NUMBER_LITERAL,
      v: result
    };
  }

  return null;
}
