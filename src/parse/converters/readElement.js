import { ANCHOR, DOCTYPE, ELEMENT, ATTRIBUTE } from 'config/types';
import { voidElements } from 'utils/html';
import { READERS, PARTIAL_READERS } from '../_parse';
import cleanup from 'parse/utils/cleanup';
import readMustache from './readMustache';
import readClosingTag from './element/readClosingTag';
import readClosing from './mustache/section/readClosing';
import { create } from 'utils/object';
import { isString } from 'utils/is';
import hyphenateCamel from 'utils/hyphenateCamel';

const tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
const anchorPattern = /^[a-zA-Z_$][-a-zA-Z0-9_$]*/;
const validTagNameFollower = /^[\s\n\/>]/;
const exclude = { exclude: true };

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

export default readElement;

function readElement(parser) {
  let attribute,
    selfClosing,
    children,
    partials,
    hasPartials,
    child,
    closed,
    pos,
    remaining,
    closingTag,
    anchor;

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

  const element = {};
  if (parser.includeLinePositions) {
    element.q = parser.getLinePos(start);
  }

  // check for doctype decl
  if (parser.matchString('!')) {
    element.t = DOCTYPE;
    if (!parser.matchPattern(/^doctype/i)) {
      parser.error('Expected DOCTYPE declaration');
    }

    element.a = parser.matchPattern(/^(.+?)>/);
    return element;
  } else if ((anchor = parser.matchString('#'))) {
    // check for anchor
    parser.sp();
    element.t = ANCHOR;
    element.n = parser.matchPattern(anchorPattern);
  } else {
    // otherwise, it's an element/component
    element.t = ELEMENT;

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

  const lowerCaseName = (element.e || element.n).toLowerCase();
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
      } else if (anchor && readAnchorClose(parser, element.n)) {
        closed = true;
      } else {
        // implicit close by closing section tag. TODO clean this up
        const tag = {
          open: parser.standardDelimiters[0],
          close: parser.standardDelimiters[1]
        };
        if (readClosing(parser, tag) || readInline(parser, tag)) {
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
    let a;
    while (i < attrs.length) {
      a = attrs[i];

      if (a.t !== ATTRIBUTE) {
        i++;
        continue;
      }

      if (a.n.indexOf('class-') === 0 && !a.f) {
        // static class directives
        (classes || (classes = [])).push(a.n.slice(6));
        attrs.splice(i, 1);
      } else if (a.n.indexOf('style-') === 0 && isString(a.f)) {
        // static style directives
        (styles || (styles = [])).push(`${hyphenateCamel(a.n.slice(6))}: ${a.f};`);
        attrs.splice(i, 1);
      } else if (a.n === 'class' && isString(a.f)) {
        // static class attrs
        (classes || (classes = [])).push(a.f);
        attrs.splice(i, 1);
      } else if (a.n === 'style' && isString(a.f)) {
        // static style attrs
        (styles || (styles = [])).push(`${a.f};`);
        attrs.splice(i, 1);
      } else if (a.n === 'class') {
        cls = a;
        i++;
      } else if (a.n === 'style') {
        style = a;
        i++;
      } else if (
        !~a.n.indexOf(':') &&
        a.n !== 'value' &&
        a.n !== 'contenteditable' &&
        isString(a.f)
      ) {
        a.g = 1;
        i++;
      } else {
        i++;
      }
    }

    if (classes) {
      if (!cls || !isString(cls.f))
        attrs.unshift({ t: ATTRIBUTE, n: 'class', f: classes.join(' '), g: 1 });
      else cls.f += ' ' + classes.join(' ');
    } else if (cls && isString(cls.f)) cls.g = 1;

    if (styles) {
      if (!style || !isString(style.f))
        attrs.unshift({ t: ATTRIBUTE, n: 'style', f: styles.join(' '), g: 1 });
      else style.f += '; ' + styles.join(' ');
    } else if (style && isString(style.f)) style.g = 1;
  }

  return element;
}

function canContain(name, remaining) {
  const match = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(remaining);
  const disallowed = disallowedContents[name];

  if (!match || !disallowed) {
    return true;
  }

  return !~disallowed.indexOf(match[1].toLowerCase());
}

function readAnchorClose(parser, name) {
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
function readInline(parser, tag) {
  const pos = parser.pos;
  if (!parser.matchString(tag.open)) return;
  if (parser.matchPattern(inlines)) {
    return true;
  } else {
    parser.pos = pos;
  }
}
