import TemplateItemType from 'config/types';

import { READERS, StandardParser, StandardParserTag } from '../_parse';

import readClosing from './mustache/section/readClosing';
import type { InlinePartialDefinitionTemplateItem } from './templateItemDefinitions';

const partialDefinitionSectionPattern = /^\s*#\s*partial\s+/;

export default function readPartialDefinitionSection(
  parser: StandardParser
): InlinePartialDefinitionTemplateItem {
  let child, closed;

  const start = parser.pos;

  const delimiters = parser.standardDelimiters;

  if (!parser.matchString(delimiters[0])) {
    return null;
  }

  if (!parser.matchPattern(partialDefinitionSectionPattern)) {
    parser.pos = start;
    return null;
  }

  const name = parser.matchPattern(/^[a-zA-Z_$][a-zA-Z_$0-9\-\/]*/);

  if (!name) {
    parser.error('expected legal partial name');
  }

  parser.sp();
  if (!parser.matchString(delimiters[1])) {
    parser.error(`Expected closing delimiter '${delimiters[1]}'`);
  }

  const content = [];

  const [open, close] = delimiters;

  do {
    // We don't need all StandardParserTag inside readClosing so force type
    if ((child = readClosing(parser, { open, close } as StandardParserTag))) {
      if (child.r !== 'partial') {
        parser.error(`Expected ${open}/partial${close}`);
      }

      closed = true;
    } else {
      child = parser.read(READERS);

      if (!child) {
        parser.error(`Expected ${open}/partial${close}`);
      }

      content.push(child);
    }
  } while (!closed);

  return {
    t: TemplateItemType.INLINE_PARTIAL,
    n: name,
    f: content
  };
}
