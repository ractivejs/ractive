import TemplateItemType from 'config/types';
import {
  SectionMustacheTemplateItem,
  DelimiterChangeToken
} from 'parse/converters/mustache/mustacheDefinitions';
import { CommentTemplateItem } from 'parse/converters/templateItemDefinitions';
import { lastItem } from 'utils/array';
import { isString } from 'utils/is';

const leadingLinebreak = /^[ \t\f\r\n]*\r?\n/;
const trailingLinebreak = /\r?\n[ \t\f\r\n]*$/;

export default function stripStandalones(items: unknown[]): unknown[] {
  let i: number;
  let current: unknown;
  let backOne: unknown;
  let backTwo: unknown;
  let lastSectionItem;

  for (i = 1; i < items.length; i += 1) {
    current = items[i];
    backOne = items[i - 1];
    backTwo = items[i - 2];

    // if we're at the end of a [text][comment][text] sequence...
    if (
      isString(current) &&
      (isComment(backOne) || isDelimiterChange(backOne)) &&
      isString(backTwo)
    ) {
      // ... and the comment is a standalone (i.e. line breaks either side)...
      if (trailingLinebreak.test(backTwo) && leadingLinebreak.test(current)) {
        // ... then we want to remove the whitespace after the first line break
        items[i - 2] = backTwo.replace(trailingLinebreak, '\n');

        // and the leading line break of the second text token
        items[i] = current.replace(leadingLinebreak, '');
      }
    }

    // if the current item is a section, and it is preceded by a linebreak, and
    // its first item is a linebreak...
    if (isSection(current) && isString(backOne)) {
      if (
        trailingLinebreak.test(backOne) &&
        isString(current.f[0]) &&
        leadingLinebreak.test(current.f[0])
      ) {
        items[i - 1] = backOne.replace(trailingLinebreak, '\n');
        current.f[0] = current.f[0].replace(leadingLinebreak, '');
      }
    }

    // if the last item was a section, and it is followed by a linebreak, and
    // its last item is a linebreak...
    if (isString(current) && isSection(backOne)) {
      lastSectionItem = lastItem(backOne.f);

      if (
        isString(lastSectionItem) &&
        trailingLinebreak.test(lastSectionItem) &&
        leadingLinebreak.test(current)
      ) {
        backOne.f[backOne.f.length - 1] = lastSectionItem.replace(trailingLinebreak, '\n');
        items[i] = current.replace(leadingLinebreak, '');
      }
    }
  }

  return items;
}

function isComment(item): item is CommentTemplateItem {
  return item.t === TemplateItemType.COMMENT;
}

function isDelimiterChange(item): item is DelimiterChangeToken {
  return item.t === TemplateItemType.DELIMCHANGE;
}

function isSection(item): item is SectionMustacheTemplateItem {
  return item.t === TemplateItemType.SECTION && item.f;
}
