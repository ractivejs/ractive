import TemplateItemType from 'config/types';
import type { StandardParser, StandardParserTag } from 'parse/_parse';

import type { ClosingMustacheTemplateItem } from '../mustacheDefinitions';

export default function readClosing(
  parser: StandardParser,
  tag: StandardParserTag
): ClosingMustacheTemplateItem {
  const start = parser.pos;

  if (!parser.matchString(tag.open)) {
    return null;
  }

  parser.sp();

  if (!parser.matchString('/')) {
    parser.pos = start;
    return null;
  }

  parser.sp();

  const remaining = parser.remaining();
  const index = remaining.indexOf(tag.close);

  if (index !== -1) {
    const closing: ClosingMustacheTemplateItem = {
      t: TemplateItemType.CLOSING,
      r: remaining.substr(0, index).split(' ')[0]
    };

    parser.pos += index;

    if (!parser.matchString(tag.close)) {
      parser.error(`Expected closing delimiter '${tag.close}'`);
    }

    return closing;
  }

  parser.pos = start;
  return null;
}
