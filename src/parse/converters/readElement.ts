import TemplateItemType from 'config/types';
import cleanup from 'parse/utils/cleanup';
import { voidElements } from 'utils/html';
import hyphenateCamel from 'utils/hyphenateCamel';
import { isString } from 'utils/is';
import { create } from 'utils/object';

import { READERS, PARTIAL_READERS, StandardParser, StandardParserTag } from '../_parse';

import type {
  ClosingTagTemplateItem,
  ExcludedElementTemplateItem
} from './element/elementDefinitions';
import readClosingTag from './element/readClosingTag';
import readClosing from './mustache/section/readClosing';
import readMustache from './readMustache';
import type {
  DoctypeTemplateItem,
  ElementTemplateItem,
  AnchorTemplateItem,
  PartialRegistryTemplateItem
} from './templateItemDefinitions';

const tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
const anchorPattern = /^[a-zA-Z_$][-a-zA-Z0-9_$]*/;
const validTagNameFollower = /^[\s\n\/>]/;
const semiEnd = /;\s*$/;
const exclude: ExcludedElementTemplateItem = { exclude: true };

// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
const disallowedContents = {
  li: ['li'],
  dt: ['dt', 'dd'],
  dd: ['dt', 'dd'],
  p: 'address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul'.split(
    ' '
  ),
  rt: ['rt', 'rp'],
  rp: ['rt', 'rp'],
  optgroup: ['optgroup'],
  option: ['option', 'optgroup'],
  thead: ['tbody', 'tfoot'],
  tbody: ['tbody', 'tfoot'],
  tfoot: ['tbody'],
  tr: ['tr', 'tbody'],
  td: ['td', 'th', 'tr'],
  th: ['td', 'th', 'tr']
};

export default function readElement(
  parser: StandardParser
): ElementTemplateItem | AnchorTemplateItem | ExcludedElementTemplateItem | DoctypeTemplateItem {
  // todo add correct typings on all variables below
  let attribute;
  let selfClosing: boolean;
  let children;
  let partials: PartialRegistryTemplateItem;
  let hasPartials: boolean;
  let child;
  let closed: boolean;
  let pos: number;
  let remaining: string;
  let closingTag: ClosingTagTemplateItem;
  let anchor: string;

  const start = parser.pos;

  if (parser.inside || parser.inAttribute || parser.textOnlyMode) {
    return null;
  }

  if (!parser.matchString('<')) {
    return null;
  }

  // if this is a closing tag, abort straight away
  if (parser.nextChar() === '/') {
    return null;
  }

  const element: ElementTemplateItem = {} as ElementTemplateItem;
  if (parser.includeLinePositions) {
    element.q = parser.getLinePos(start);
  }

  // check for doctype decl
  if (parser.matchString('!')) {
    const doctypeTemplateElement: DoctypeTemplateItem = (element as unknown) as DoctypeTemplateItem;
    doctypeTemplateElement.t = TemplateItemType.DOCTYPE;
    if (!parser.matchPattern(/^doctype/i)) {
      parser.error('Expected DOCTYPE declaration');
    }

    doctypeTemplateElement.a = parser.matchPattern(/^(.+?)>/);
    return doctypeTemplateElement;
  } else if ((anchor = parser.matchString('#'))) {
    // check for anchor
    parser.sp();

    // create a reference to element but with AnchorTemplateItem type
    const anchor = (element as unknown) as AnchorTemplateItem;
    anchor.t = TemplateItemType.ANCHOR;
    anchor.n = parser.matchPattern(anchorPattern);
  } else {
    // otherwise, it's an element/component
    element.t = TemplateItemType.ELEMENT;

    // element name
    element.e = parser.matchPattern(tagNamePattern);
    if (!element.e) {
      return null;
    }
  }

  // next character must be whitespace, closing solidus or '>'
  if (!validTagNameFollower.test(parser.nextChar())) {
    parser.error('Illegal tag name');
  }

  parser.sp();

  parser.inTag = true;

  // directives and attributes
  while ((attribute = readMustache(parser))) {
    if (attribute !== false) {
      if (!element.m) element.m = [];
      element.m.push(attribute);
    }

    parser.sp();
  }

  parser.inTag = false;

  // allow whitespace before closing solidus
  parser.sp();

  // self-closing solidus?
  if (parser.matchString('/')) {
    selfClosing = true;
  }

  // closing angle bracket
  if (!parser.matchString('>')) {
    return null;
  }

  const templateItemName = getTemplateItemName(element);
  const lowerCaseName = templateItemName.toLowerCase();
  const preserveWhitespace = parser.preserveWhitespace;

  if (!selfClosing && (anchor || !voidElements[element.e.toLowerCase()])) {
    if (!anchor) {
      parser.elementStack.push(lowerCaseName);

      // Special case - if we open a script element, further tags should
      // be ignored unless they're a closing script element
      if (lowerCaseName in parser.interpolate) {
        parser.inside = lowerCaseName;
      }
    }

    children = [];
    partials = create(null);

    do {
      pos = parser.pos;
      remaining = parser.remaining();

      if (!remaining) {
        // if this happens to be a script tag and there's no content left, it's because
        // a closing script tag can't appear in a script
        if (parser.inside === 'script') {
          closed = true;
          break;
        }

        parser.error(
          `Missing end ${parser.elementStack.length > 1 ? 'tags' : 'tag'} (${parser.elementStack
            .reverse()
            .map(x => `</${x}>`)
            .join('')})`
        );
      }

      // if for example we're in an <li> element, and we see another
      // <li> tag, close the first so they become siblings
      if (!anchor && !canContain(lowerCaseName, remaining)) {
        closed = true;
      } else if (!anchor && (closingTag = readClosingTag(parser))) {
        // closing tag
        closed = true;

        const closingTagName = closingTag.e.toLowerCase();

        // if this *isn't* the closing tag for the current element...
        if (closingTagName !== lowerCaseName) {
          // rewind parser
          parser.pos = pos;

          // if it doesn't close a parent tag, error
          if (!~parser.elementStack.indexOf(closingTagName)) {
            let errorMessage = 'Unexpected closing tag';

            // add additional help for void elements, since component names
            // might clash with them
            if (voidElements[closingTagName.toLowerCase()]) {
              errorMessage += ` (<${closingTagName}> is a void element - it cannot contain children)`;
            }

            parser.error(errorMessage);
          }
        }
      } else if (anchor && readAnchorClose(parser, templateItemName)) {
        closed = true;
      } else {
        // implicit close by closing section tag. TODO clean this up
        const tag = {
          open: parser.standardDelimiters[0],
          close: parser.standardDelimiters[1]
        };
        if (
          readClosing(parser, tag as StandardParserTag) ||
          readInline(parser, tag as StandardParserTag)
        ) {
          closed = true;
          parser.pos = pos;
        } else if ((child = parser.read(PARTIAL_READERS))) {
          if (partials[child.n]) {
            parser.pos = pos;
            parser.error('Duplicate partial definition');
          }

          cleanup(
            child.f,
            parser.stripComments,
            preserveWhitespace,
            !preserveWhitespace,
            !preserveWhitespace,
            parser.whiteSpaceElements
          );

          partials[child.n] = child.f;
          hasPartials = true;
        } else {
          if ((child = parser.read(READERS))) {
            children.push(child);
          } else {
            closed = true;
          }
        }
      }
    } while (!closed);

    if (children.length) {
      element.f = children;
    }

    if (hasPartials) {
      element.p = partials;
    }

    parser.elementStack.pop();
  }

  parser.inside = null;

  if (parser.sanitizeElements && parser.sanitizeElements.indexOf(lowerCaseName) !== -1) {
    return exclude;
  }

  if (element.t === TemplateItemType.ELEMENT) {
    processInputElement(element);
  }

  return element;
}

function canContain(name: string, remaining: string): boolean {
  const match = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(remaining);
  const disallowed = disallowedContents[name];

  if (!match || !disallowed) {
    return true;
  }

  return !~disallowed.indexOf(match[1].toLowerCase());
}

function readAnchorClose(parser: StandardParser, name: string): boolean {
  const pos = parser.pos;
  if (!parser.matchString('</')) {
    return null;
  }

  parser.matchString('#');
  parser.sp();

  if (!parser.matchString(name)) {
    parser.pos = pos;
    return null;
  }

  parser.sp();

  if (!parser.matchString('>')) {
    parser.pos = pos;
    return null;
  }

  return true;
}

const inlines = /^\s*(elseif|else|then|catch)\s*/;
function readInline(parser: StandardParser, tag: StandardParserTag): boolean {
  const pos = parser.pos;
  if (!parser.matchString(tag.open)) return;
  if (parser.matchPattern(inlines)) {
    return true;
  } else {
    parser.pos = pos;
  }
}

function processInputElement(element: ElementTemplateItem): void {
  const lowerCaseName = element.e.toLowerCase();
  if (
    element.m &&
    lowerCaseName !== 'input' &&
    lowerCaseName !== 'select' &&
    lowerCaseName !== 'textarea' &&
    lowerCaseName !== 'option'
  ) {
    const attrs = element.m;
    let classes, styles, cls, style;
    let i = 0;
    let attribute;
    while (i < attrs.length) {
      attribute = attrs[i];

      if (attribute.t !== TemplateItemType.ATTRIBUTE) {
        i++;
        continue;
      }

      if (attribute.n.indexOf('class-') === 0 && !attribute.f) {
        // static class directives
        (classes || (classes = [])).push(attribute.n.slice(6));
        attrs.splice(i, 1);
      } else if (attribute.n.indexOf('style-') === 0 && isString(attribute.f)) {
        // static style directives
        (styles || (styles = [])).push(`${hyphenateCamel(attribute.n.slice(6))}: ${attribute.f};`);
        attrs.splice(i, 1);
      } else if (attribute.n === 'class' && isString(attribute.f)) {
        // static class attrs
        (classes || (classes = [])).push(attribute.f);
        attrs.splice(i, 1);
      } else if (attribute.n === 'style' && isString(attribute.f)) {
        // static style attrs
        (styles || (styles = [])).push(attribute.f + (semiEnd.test(attribute.f) ? '' : ';'));
        attrs.splice(i, 1);
      } else if (attribute.n === 'class') {
        cls = attribute;
        i++;
      } else if (attribute.n === 'style') {
        style = attribute;
        i++;
      } else if (
        !~attribute.n.indexOf(':') &&
        attribute.n !== 'value' &&
        attribute.n !== 'contenteditable' &&
        isString(attribute.f)
      ) {
        attribute.g = 1;
        i++;
      } else {
        i++;
      }
    }

    if (classes) {
      if (!cls || !isString(cls.f))
        attrs.unshift({ t: TemplateItemType.ATTRIBUTE, n: 'class', f: classes.join(' '), g: 1 });
      else cls.f += ' ' + classes.join(' ');
    } else if (cls && isString(cls.f)) cls.g = 1;

    if (styles) {
      if (!style || !isString(style.f))
        attrs.unshift({ t: TemplateItemType.ATTRIBUTE, n: 'style', f: styles.join(' '), g: 1 });
      else style.f += '; ' + styles.join(' ');
    } else if (style && isString(style.f)) style.g = 1;
  }
}

function getTemplateItemName(input: ElementTemplateItem | AnchorTemplateItem): string {
  if (input.t === TemplateItemType.ANCHOR) {
    return input.n;
  }
  return input.e;
}
