import TemplateItemType from 'config/types';
import type { StandardParser } from 'parse/_parse';

import type { ClosingTagTemplateItem } from './elementDefinitions';

const closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;

export default function readClosingTag(parser: StandardParser): ClosingTagTemplateItem {
  let tag: string;

  const start = parser.pos;

  // are we looking at a closing tag?
  if (!parser.matchString('</')) {
    return null;
  }

  if ((tag = parser.matchPattern(closingTagPattern))) {
    if (parser.inside && tag !== parser.inside) {
      parser.pos = start;
      return null;
    }

    return {
      t: TemplateItemType.CLOSING_TAG,
      e: tag
    };
  }

  // We have an illegal closing tag, report it
  parser.pos -= 2;
  parser.error('Illegal closing tag');
}
