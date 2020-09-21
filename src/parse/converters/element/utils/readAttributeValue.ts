import type { StandardParser } from 'parse/_parse';
import readMustache from 'parse/converters/readMustache';
import getLowestIndex from 'parse/converters/utils/getLowestIndex';
import { decodeCharacterReferences } from 'utils/html';
import { isString } from 'utils/is';

import type { GenericAttributeTemplateValue } from '../elementDefinitions';

const unquotedAttributeValueTextPattern = /^[^\s"'=<>\/`]+/;
type QuoteMark = `'` | `"`;

export function readAttributeValue(parser: StandardParser): GenericAttributeTemplateValue {
  const start = parser.pos;

  // next character must be `=`, `/`, `>` or whitespace
  if (!/[=\/>\s]/.test(parser.nextChar())) {
    parser.error('Expected `=`, `/`, `>` or whitespace');
  }

  parser.sp();

  if (!parser.matchString('=')) {
    parser.pos = start;
    return null;
  }

  parser.sp();

  const valueStart = parser.pos;
  const startDepth = parser.sectionDepth;

  const value =
    readQuotedAttributeValue(parser, `'`) ||
    readQuotedAttributeValue(parser, `"`) ||
    readUnquotedAttributeValue(parser);

  if (value === null) {
    parser.error('Expected valid attribute value');
  }

  if (parser.sectionDepth !== startDepth) {
    parser.pos = valueStart;
    parser.error(
      'An attribute value must contain as many opening section tags as closing section tags'
    );
  }

  if (!value.length) {
    return '';
  }

  if (value.length === 1 && isString(value[0])) {
    return decodeCharacterReferences(value[0]);
  }

  return value;
}

function readUnquotedAttributeValue(parser) {
  parser.inAttribute = true;

  const tokens = [];

  let token = readMustache(parser) || readUnquotedAttributeValueToken(parser);
  while (token) {
    tokens.push(token);
    token = readMustache(parser) || readUnquotedAttributeValueToken(parser);
  }

  if (!tokens.length) {
    return null;
  }

  parser.inAttribute = false;
  return tokens;
}

function readUnquotedAttributeValueToken(parser: StandardParser): string {
  let text: string, index: number;

  const start = parser.pos;

  text = parser.matchPattern(unquotedAttributeValueTextPattern);

  if (!text) {
    return null;
  }

  const haystack = text;
  const needles = parser.tags.map(t => t.open); // TODO refactor... we do this in readText.js as well

  if ((index = getLowestIndex(haystack, needles)) !== -1) {
    text = text.substr(0, index);
    parser.pos = start + text.length;
  }

  return text;
}

function readQuotedAttributeValue(parser, quoteMark) {
  const start = parser.pos;

  if (!parser.matchString(quoteMark)) {
    return null;
  }

  parser.inAttribute = quoteMark;

  const tokens = [];

  let token = readMustache(parser) || readQuotedStringToken(parser, quoteMark);
  while (token !== null) {
    tokens.push(token);
    token = readMustache(parser) || readQuotedStringToken(parser, quoteMark);
  }

  if (!parser.matchString(quoteMark)) {
    parser.pos = start;
    return null;
  }

  parser.inAttribute = false;

  return tokens;
}

function readQuotedStringToken(parser: StandardParser, quoteMark: QuoteMark): string {
  const haystack = parser.remaining();

  const needles = parser.tags.map(t => t.open); // TODO refactor... we do this in readText.js as well
  needles.push(quoteMark);

  const index = getLowestIndex(haystack, needles);

  if (index === -1) {
    parser.error('Quoted attribute value must have a closing quote');
  }

  if (!index) {
    return null;
  }

  parser.pos += index;
  return haystack.substr(0, index);
}
