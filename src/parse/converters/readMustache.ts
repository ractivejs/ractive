import TemplateItemType from 'config/types';
import type { StandardParser, StandardParserTag, Reader } from 'parse/_parse';

import type { AttributesOrDirectiveTemplateItem } from './element/elementDefinitions';
import { readAttributeOrDirective } from './element/readAttribute';
import readRegexpLiteral from './expressions/primary/literal/readRegexpLiteral';
import type { MustachePrimaryItem, DelimiterChangeToken } from './mustache/mustacheDefinitions';
import readDelimiterChange from './mustache/readDelimiterChange';

const delimiterChangeToken: DelimiterChangeToken = {
  t: TemplateItemType.DELIMCHANGE,
  exclude: true
};

export default function readMustache(
  parser: StandardParser
): MustachePrimaryItem | AttributesOrDirectiveTemplateItem {
  let mustache: MustachePrimaryItem | AttributesOrDirectiveTemplateItem, i: number;

  // If we're inside a <script> or <style> tag, and we're not
  // interpolating, bug out
  if (parser.interpolate[parser.inside] === false) {
    return null;
  }

  for (i = 0; i < parser.tags.length; i += 1) {
    if ((mustache = readMustacheOfType(parser, parser.tags[i]))) {
      return mustache;
    }
  }

  if (parser.inTag && !parser.inAttribute) {
    mustache = readAttributeOrDirective(parser);
    if (mustache) {
      parser.sp();
      return mustache;
    }
  }
}

function readMustacheOfType(parser: StandardParser, tag: StandardParserTag): MustachePrimaryItem {
  const start = parser.pos;

  if (parser.matchString('\\' + tag.open)) {
    if (start === 0 || parser.str[start - 1] !== '\\') {
      return tag.open;
    }
  } else if (!parser.matchString(tag.open)) {
    return null;
  }

  // delimiter change?
  let mustache: [string, string];
  if ((mustache = readDelimiterChange(parser))) {
    // find closing delimiter or abort...
    if (!parser.matchString(tag.close)) {
      return null;
    }

    // ...then make the switch
    tag.open = mustache[0];
    tag.close = mustache[1];
    parser.sortMustacheTags();

    return delimiterChangeToken;
  }

  parser.sp();

  // illegal section closer
  if (parser.matchString('/')) {
    parser.pos -= 1;
    const rewind = parser.pos;
    if (!readRegexpLiteral(parser)) {
      parser.pos = rewind - tag.close.length;
      if (parser.inAttribute) {
        parser.pos = start;
        return null;
      } else {
        parser.error("Attempted to close a section that wasn't open");
      }
    } else {
      parser.pos = rewind;
    }
  }

  // todo integrate MustachePrimaryItem with the s and q properties
  let mustacheItem: MustachePrimaryItem, reader: Reader, i: number;
  for (i = 0; i < tag.readers.length; i += 1) {
    reader = tag.readers[i];

    if ((mustacheItem = reader(parser, tag))) {
      if (tag.isStatic) {
        (mustacheItem as any).s = 1;
      }

      if (parser.includeLinePositions) {
        (mustacheItem as any).q = parser.getLinePos(start);
      }

      return mustacheItem;
    }
  }

  parser.pos = start;
  return null;
}
