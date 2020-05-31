import readExpression from 'parse/converters/readExpression';
import TemplateItemType from 'config/types';
import {
  escapeSequencePattern,
  lineContinuationPattern
} from './stringLiteral/makeQuotedStringMatcher';
import { StandardParser } from 'parse/_parse';
import { BrackedTemplateItem, ValueTemplateItem } from 'parse/TemplateItems';

// Match one or more characters until: ", ', or \
const stringMiddlePattern = /^[^`"\\\$]+?(?:(?=[`"\\\$]))/;

const escapes = /[\r\n\t\b\f]/g;
function getString(literal: string): string {
  return JSON.parse(`"${literal.replace(escapes, escapeChar)}"`);
}

function escapeChar(c: string): string {
  switch (c) {
    case '\n':
      return '\\n';
    case '\r':
      return '\\r';
    case '\t':
      return '\\t';
    case '\b':
      return '\\b';
    case '\f':
      return '\\f';
  }
}

export default function readTemplateStringLiteral(
  parser: StandardParser
): BrackedTemplateItem | ValueTemplateItem {
  if (!parser.matchString('`')) return null;

  let literal = '';
  let done = false;
  let next: string;
  const parts = [];

  while (!done) {
    next =
      parser.matchPattern(stringMiddlePattern) ||
      parser.matchPattern(escapeSequencePattern) ||
      parser.matchString('$') ||
      parser.matchString('"');
    if (next) {
      if (next === `"`) {
        literal += `\\"`;
      } else if (next === '\\`') {
        literal += '`';
      } else if (next === '$') {
        if (parser.matchString('{')) {
          parts.push({ t: TemplateItemType.STRING_LITERAL, v: getString(literal) });
          literal = '';

          parser.sp();
          const expr = readExpression(parser);

          if (!expr) parser.error('Expected valid expression');

          parts.push({ t: TemplateItemType.BRACKETED, x: expr });

          parser.sp();
          if (!parser.matchString('}'))
            parser.error(`Expected closing '}' after interpolated expression`);
        } else {
          literal += '$';
        }
      } else {
        literal += next;
      }
    } else {
      next = parser.matchPattern(lineContinuationPattern);
      if (next) {
        // convert \(newline-like) into a \u escape, which is allowed in JSON
        literal += '\\u' + ('000' + next.charCodeAt(1).toString(16)).slice(-4);
      } else {
        done = true;
      }
    }
  }

  if (literal.length) parts.push({ t: TemplateItemType.STRING_LITERAL, v: getString(literal) });

  if (!parser.matchString('`')) parser.error("Expected closing '`'");

  if (!parts.length) {
    // empty string literal
    return { t: TemplateItemType.STRING_LITERAL, v: '' };
  } else if (parts.length === 1) {
    return parts[0];
  } else {
    let result = parts.pop();
    let part;

    while ((part = parts.pop())) {
      result = {
        t: TemplateItemType.INFIX_OPERATOR,
        s: '+',
        o: [part, result]
      };
    }

    return {
      t: TemplateItemType.BRACKETED,
      x: result
    };
  }
}
