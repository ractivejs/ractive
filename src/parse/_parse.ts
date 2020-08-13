import { TEMPLATE_VERSION } from 'config/template';
import { ParseOpts, ParseDelimiters, InterpolateOpts, WhitespaceElements } from 'types/Parse';
import { isObjectType } from 'utils/is';
import { assign, keys } from 'utils/object';

import shared from '../Ractive/shared';

import readInterpolator from './converters/mustache/readInterpolator';
import readMustacheComment from './converters/mustache/readMustacheComment';
import readPartial from './converters/mustache/readPartial';
import readSection from './converters/mustache/readSection';
import readTriple from './converters/mustache/readTriple';
import readUnescaped from './converters/mustache/readUnescaped';
import readElement from './converters/readElement';
import readExpression from './converters/readExpression';
import readHtmlComment from './converters/readHtmlComment';
import readMustache from './converters/readMustache';
import readPartialDefinitionSection from './converters/readPartialDefinitionSection';
import readTemplate from './converters/readTemplate';
import readText from './converters/readText';
import {
  TemplateModel,
  ExpressionFunctionTemplateItem
} from './converters/templateItemDefinitions';
import Parser, { CustomParser } from './Parser';
import cleanup from './utils/cleanup';
import { fromExpression } from './utils/createFunction';
import flattenExpression from './utils/flattenExpression';
import insertExpressions from './utils/insertExpressions';

// See https://github.com/ractivejs/template-spec for information
// about the Ractive template specification

export interface StandardParserTag {
  isStatic: boolean;
  isTriple: boolean;
  open: string;
  close: string;
  readers: Reader[];
}

export type Reader = (parser: StandardParser, tag?: StandardParserTag) => any;

const STANDARD_READERS: Reader[] = [
  readPartial,
  readUnescaped,
  readSection,
  readInterpolator,
  readMustacheComment
];
const TRIPLE_READERS: Reader[] = [readTriple];

export const READERS: Reader[] = [readMustache, readHtmlComment, readElement, readText];
export const PARTIAL_READERS: Reader[] = [readPartialDefinitionSection];

const preserveWhitespaceElements: WhitespaceElements = {
  pre: 1,
  script: 1,
  style: 1,
  textarea: 1
};

const defaultInterpolate: InterpolateOpts = {
  textarea: true,
  script: true,
  style: true,
  template: true
};

// todo replace (shared as any) with correct type
export class StandardParser extends Parser implements CustomParser {
  // options
  public standardDelimiters: ParseDelimiters;
  public stripComments: boolean;
  public preserveWhitespace: boolean;
  public allowExpressions: boolean;
  public interpolate: InterpolateOpts;
  public sanitizeElements: string[];
  public sanitizeEventAttributes: boolean;
  public includeLinePositions: boolean;
  public textOnlyMode: boolean;
  public csp: boolean;
  public expression: boolean;

  // todo this option is read but never set maybe we can remove it
  public strictRefinement: boolean;

  public tags: StandardParserTag[];
  public contextLines: any;
  public sectionDepth: number;
  public elementStack: any[];
  public spreadArgs: boolean;
  public whiteSpaceElements: WhitespaceElements;

  /**
   * flag to indicate that `foo-bar` should be read as a single name,
   * rather than 'subtract bar from foo'
   */
  public relaxedNames: boolean;

  public inEvent: boolean;
  public inTag: boolean;
  public inAttribute: boolean;
  public inUnquotedAttribute: boolean;

  /** contains the name of the HTML tag currently parsed */
  public inside: string;

  init(_str: string, options: ParseOpts): void {
    const tripleDelimiters = options.tripleDelimiters || (shared as any).defaults.tripleDelimiters;
    const staticDelimiters = options.staticDelimiters || (shared as any).defaults.staticDelimiters;
    const staticTripleDelimiters =
      options.staticTripleDelimiters || (shared as any).defaults.staticTripleDelimiters;

    this.standardDelimiters = options.delimiters || (shared as any).defaults.delimiters;

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

    this.contextLines = options.contextLines || (shared as any).defaults.contextLines;

    this.sortMustacheTags();

    this.sectionDepth = 0;
    this.elementStack = [];

    this.interpolate = assign(
      {},
      defaultInterpolate,
      (shared as any).defaults.interpolate,
      options.interpolate
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
    this.preserveWhitespace = isObjectType(options.preserveWhitespace)
      ? false
      : options.preserveWhitespace;
    this.sanitizeElements = options.sanitize && options.sanitize.elements;
    this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
    this.includeLinePositions = options.includeLinePositions;
    this.textOnlyMode = options.textOnlyMode;
    this.csp = options.csp;
    this.allowExpressions = options.allowExpressions;

    if (options.expression) this.converters = [readExpression];
    else this.converters = [readTemplate];

    if (options.attributes) this.inTag = true;

    // special whitespace handling requested for certain elements
    this.whiteSpaceElements = assign({}, options.preserveWhitespace, preserveWhitespaceElements);
  }

  postProcess(result, options: ParseOpts): TemplateModel | ExpressionFunctionTemplateItem {
    const [parserResult] = result;

    if (options.expression) {
      const expr = flattenExpression(parserResult);
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
        parserResult.t,
        this.stripComments,
        this.preserveWhitespace,
        !this.preserveWhitespace,
        !this.preserveWhitespace,
        this.whiteSpaceElements
      );

      if (this.csp !== false) {
        const expr = {};

        insertExpressions(parserResult.t, expr);
        insertExpressions(parserResult.p || {}, expr);

        if (keys(expr).length) parserResult.e = expr;
      }

      return parserResult;
    }
  }

  /**
   * Sort in order of descending opening delimiter length (longer first),
   * to protect against opening delimiters being substrings of each other
   */
  sortMustacheTags(): void {
    this.tags.sort((a, b) => {
      return b.open.length - a.open.length;
    });
  }
}

export default function parse<T>(template: string, options: ParseOpts): T {
  return new StandardParser(template, options || {}).result;
}
