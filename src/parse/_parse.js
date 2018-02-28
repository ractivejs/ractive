import { TEMPLATE_VERSION } from 'config/template';
import Parser from './Parser';
import readMustache from './converters/readMustache';
import readTriple from './converters/mustache/readTriple';
import readUnescaped from './converters/mustache/readUnescaped';
import readPartial from './converters/mustache/readPartial';
import readMustacheComment from './converters/mustache/readMustacheComment';
import readInterpolator from './converters/mustache/readInterpolator';
import readSection from './converters/mustache/readSection';
import readHtmlComment from './converters/readHtmlComment';
import readElement from './converters/readElement';
import readText from './converters/readText';
import readPartialDefinitionSection from './converters/readPartialDefinitionSection';
import readTemplate from './converters/readTemplate';
import readExpression from './converters/readExpression';
import { fromExpression } from './utils/createFunction';
import cleanup from './utils/cleanup';
import insertExpressions from './utils/insertExpressions';
import flattenExpression from './utils/flattenExpression';
import shared from '../Ractive/shared';
import { create, keys } from 'utils/object';

// See https://github.com/ractivejs/template-spec for information
// about the Ractive template specification

const STANDARD_READERS = [
  readPartial,
  readUnescaped,
  readSection,
  readInterpolator,
  readMustacheComment
];
const TRIPLE_READERS = [readTriple];

export const READERS = [readMustache, readHtmlComment, readElement, readText];
export const PARTIAL_READERS = [readPartialDefinitionSection];

const defaultInterpolate = ['script', 'style', 'template'];

const StandardParser = Parser.extend({
  init(str, options) {
    const tripleDelimiters = options.tripleDelimiters || shared.defaults.tripleDelimiters;
    const staticDelimiters = options.staticDelimiters || shared.defaults.staticDelimiters;
    const staticTripleDelimiters =
      options.staticTripleDelimiters || shared.defaults.staticTripleDelimiters;

    this.standardDelimiters = options.delimiters || shared.defaults.delimiters;

    this.tags = [
      {
        isStatic: false,
        isTriple: false,
        open: this.standardDelimiters[0],
        close: this.standardDelimiters[1],
        readers: STANDARD_READERS
      },
      {
        isStatic: false,
        isTriple: true,
        open: tripleDelimiters[0],
        close: tripleDelimiters[1],
        readers: TRIPLE_READERS
      },
      {
        isStatic: true,
        isTriple: false,
        open: staticDelimiters[0],
        close: staticDelimiters[1],
        readers: STANDARD_READERS
      },
      {
        isStatic: true,
        isTriple: true,
        open: staticTripleDelimiters[0],
        close: staticTripleDelimiters[1],
        readers: TRIPLE_READERS
      }
    ];

    this.contextLines = options.contextLines || shared.defaults.contextLines;

    this.sortMustacheTags();

    this.sectionDepth = 0;
    this.elementStack = [];

    this.interpolate = create(options.interpolate || shared.defaults.interpolate || {});
    this.interpolate.textarea = true;
    defaultInterpolate.forEach(
      t => (this.interpolate[t] = !options.interpolate || options.interpolate[t] !== false)
    );

    if (options.sanitize === true) {
      options.sanitize = {
        // blacklist from https://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/lang/html/html4-elements-whitelist.json
        elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split(
          ' '
        ),
        eventAttributes: true
      };
    }

    this.stripComments = options.stripComments !== false;
    this.preserveWhitespace = options.preserveWhitespace;
    this.sanitizeElements = options.sanitize && options.sanitize.elements;
    this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
    this.includeLinePositions = options.includeLinePositions;
    this.textOnlyMode = options.textOnlyMode;
    this.csp = options.csp;
    this.allowExpressions = options.allowExpressions;

    if (options.expression) this.converters = [readExpression];

    if (options.attributes) this.inTag = true;
  },

  postProcess(result, options) {
    if (options.expression) {
      const expr = flattenExpression(result[0]);
      expr.e = fromExpression(expr.s, expr.r.length);
      return expr;
    } else {
      // special case - empty string
      if (!result.length) {
        return { t: [], v: TEMPLATE_VERSION };
      }

      if (this.sectionDepth > 0) {
        this.error('A section was left open');
      }

      cleanup(
        result[0].t,
        this.stripComments,
        this.preserveWhitespace,
        !this.preserveWhitespace,
        !this.preserveWhitespace
      );

      if (this.csp !== false) {
        const expr = {};
        insertExpressions(result[0].t, expr);
        if (keys(expr).length) result[0].e = expr;
      }

      return result[0];
    }
  },

  converters: [readTemplate],

  sortMustacheTags() {
    // Sort in order of descending opening delimiter length (longer first),
    // to protect against opening delimiters being substrings of each other
    this.tags.sort((a, b) => {
      return b.open.length - a.open.length;
    });
  }
});

export default function parse(template, options) {
  return new StandardParser(template, options || {}).result;
}
