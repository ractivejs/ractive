import readStringLiteral from '../primary/literal/readStringLiteral';
import readNumberLiteral from '../primary/literal/readNumberLiteral';
import { name as namePattern } from './patterns';
import { LiteralTemplateElement } from 'parse/templateElements';
import Parser from 'parse/Parser';

const identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

/**
 * can be any name, string literal, or number literal
 *
 * @see http://mathiasbynens.be/notes/javascript-properties
 */
export default function readKey(parser: Parser): string {
  let token: LiteralTemplateElement | string;

  if ((token = readStringLiteral(parser))) {
    return identifier.test(token.v) ? token.v : '"' + token.v.replace(/"/g, '\\"') + '"';
  }

  if ((token = readNumberLiteral(parser))) {
    return token.v;
  }

  if ((token = parser.matchPattern(namePattern) as string)) {
    return token;
  }

  return null;
}
