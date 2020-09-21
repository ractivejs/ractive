import TemplateItemType from 'config/types';
import type { WhitespaceElements } from 'types/Parse';
import { isString } from 'utils/is';

import stripStandalones from './stripStandalones';
import trimWhitespace from './trimWhitespace';

const contiguousWhitespace = /[ \t\f\r\n]+/g;
const leadingWhitespace = /^[ \t\f\r\n]+/;
const trailingWhitespace = /[ \t\f\r\n]+$/;
const leadingNewLine = /^(?:\r\n|\r|\n)/;
const trailingNewLine = /(?:\r\n|\r|\n)$/;

// todo add types on items

export default function cleanup(
  items,
  stripComments: boolean,
  preserveWhitespace: boolean,
  removeLeadingWhitespace: boolean,
  removeTrailingWhitespace: boolean,
  whiteSpaceElements: WhitespaceElements
): void {
  if (isString(items)) return;

  let i: number;
  let item;
  let previousItem;
  let nextItem;
  let preserveWhitespaceInsideFragment: boolean;
  let removeLeadingWhitespaceInsideFragment: boolean;
  let removeTrailingWhitespaceInsideFragment: boolean;

  // First pass - remove standalones and comments etc
  stripStandalones(items);

  i = items.length;
  while (i--) {
    item = items[i];

    // Remove delimiter changes, unsafe elements etc
    if (item.exclude) {
      items.splice(i, 1);
    } else if (stripComments && item.t === TemplateItemType.COMMENT) {
      // Remove comments, unless we want to keep them
      items.splice(i, 1);
    }
  }

  // If necessary, remove leading and trailing whitespace
  trimWhitespace(
    items,
    removeLeadingWhitespace ? leadingWhitespace : null,
    removeTrailingWhitespace ? trailingWhitespace : null
  );

  i = items.length;
  while (i--) {
    item = items[i];
    removeLeadingWhitespaceInsideFragment = removeTrailingWhitespaceInsideFragment = false;

    // Recurse
    if (item.f) {
      const isPreserveWhitespaceElement =
        item.t === TemplateItemType.ELEMENT &&
        (whiteSpaceElements[item.e.toLowerCase()] || whiteSpaceElements[item.e]);
      preserveWhitespaceInsideFragment = preserveWhitespace || isPreserveWhitespaceElement;

      if (!preserveWhitespace && isPreserveWhitespaceElement) {
        trimWhitespace(item.f, leadingNewLine, trailingNewLine);
      }

      if (!preserveWhitespaceInsideFragment) {
        previousItem = items[i - 1];
        nextItem = items[i + 1];

        // if the previous item was a text item with trailing whitespace,
        // remove leading whitespace inside the fragment
        if (!previousItem || (isString(previousItem) && trailingWhitespace.test(previousItem))) {
          removeLeadingWhitespaceInsideFragment = true;
        }

        // and vice versa
        if (!nextItem || (isString(nextItem) && leadingWhitespace.test(nextItem))) {
          removeTrailingWhitespaceInsideFragment = true;
        }
      }

      cleanup(
        item.f,
        stripComments,
        preserveWhitespaceInsideFragment,
        removeLeadingWhitespaceInsideFragment,
        removeTrailingWhitespaceInsideFragment,
        whiteSpaceElements
      );
    }

    // Split if-else blocks into two (an if, and an unless)
    if (item.l) {
      cleanup(
        item.l,
        stripComments,
        preserveWhitespace,
        removeLeadingWhitespaceInsideFragment,
        removeTrailingWhitespaceInsideFragment,
        whiteSpaceElements
      );

      // todo we need to update template item with l definition
      item.l.forEach(s => (s.l = 1));
      item.l.unshift(i + 1, 0);
      items.splice(...item.l);
      delete item.l; // TODO would be nice if there was a way around this
    }

    // Clean up conditional attributes
    if (item.m) {
      cleanup(
        item.m,
        stripComments,
        preserveWhitespace,
        removeLeadingWhitespaceInsideFragment,
        removeTrailingWhitespaceInsideFragment,
        whiteSpaceElements
      );
      if (item.m.length < 1) delete item.m;
    }
  }

  // final pass - fuse text nodes together
  i = items.length;
  while (i--) {
    if (isString(items[i])) {
      if (isString(items[i + 1])) {
        items[i] = items[i] + items[i + 1];
        items.splice(i + 1, 1);
      }

      if (!preserveWhitespace) {
        items[i] = items[i].replace(contiguousWhitespace, ' ');
      }

      if (items[i] === '') {
        items.splice(i, 1);
      }
    }
  }
}
