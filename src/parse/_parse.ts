import { TEMPLATE_VERSION } from 'config/template';
import Parser, { CustomParser } from './Parser';
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
import { assign, keys } from 'utils/object';
import { isObjectType } from 'utils/is';
import { ParseOpts, ParseDelimiters, InterpolateOpts } from 'types/ParseOptions';
import { TemplateItemDefinition, TemplateModel, ExpressionTempleteItem } from './TemplateItems';

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

const preserveWhitespaceElements = { pre: 1, script: 1, style: 1, textarea: 1 };

const defaultInterpolate = { textarea: true, script: true, style: true, template: true };

interface StandardParserTag {
  isStatic: boolean;
  isTriple: boolean;
  open: string;
  close: string;
  readers: any[]; // todo use converter type
}

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

  public tags: StandardParserTag[];
  public contextLines: any;
  public sectionDepth: number;
  public elementStack: any[];

  public relaxedNames: any[];
  public inEvent: boolean;
  public inTag: boolean;
  public whiteSpaceElements;

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

  postProcess(result, options: ParseOpts): TemplateModel | ExpressionTempleteItem {
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

export default function parse(template: string, options: ParseOpts): TemplateItemDefinition {
  return new StandardParser(template, options || {}).result;
}