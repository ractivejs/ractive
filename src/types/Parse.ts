export type ParseDelimiters = [string, string];

export type Template = ParsedTemplate | string | any[] | ParseFn;

export interface ParsedTemplate {
  /** The version of the template spec that produced this template. */
  v: number;

  /** The array of template nodes. */
  t: any[];

  /** If csp mode was used to parse, the map of expression string -> expression functions. */
  e?: Record<string, Function>;

  /** If the template includes any partials, the map of partial name -> template nodes. */
  p?: Record<string, any>;
}

export interface ParseHelper {
  /**
   * Retrieves a template string from a script tag with the given id.j
   */
  fromId(id: string): string;

  /**
   * @returns true if the given value is a parsed template
   */
  isParsed(template: any): boolean;

  /**
   * Parse the given template with Ractive.parse.
   */
  parse(template: string, opts?: ParseOpts): ParsedTemplate;
}

export type ParseFn = (helper: ParseHelper) => string | Array<{} | string> | ParsedTemplate;

export interface SanitizeOpts {
  /** A list of element names to remove from the template. */
  elements: string[];

  /** Whether or not to remove DOM event listener attributes, like onclick, from the template. */
  eventAttributes?: boolean;
}

export interface WhitespaceElements {
  pre: number;
  script: number;
  style: number;
  textarea: number;
}

export interface BaseParseOpts {
  /** The number of lines of template above and below a line with an error to include in the error message. */
  contextLines?: number;

  /** Whether or not to produce a map of expression string -> function when parsing the template. */
  csp?: boolean;

  /** The regular mustach delimiters - defaults to {{ }}. */
  delimiters?: ParseDelimiters;

  /**
   * When `true`, preserves whitespace in templates.
   * Whitespace inside the \<pre\> element is preserved regardless of the value of this option.
   * Defaults to `false`. If the value is a map, whitespace is not preserved by default,
   * and the elements named in the map will have whitespace preserved based on the value of the boolean associated with their name.
   */
  preserveWhitespace?: boolean | WhitespaceElements;

  /** Whether or not to remove certain elements and event attributes from the parsed template. */
  sanitize?: boolean | SanitizeOpts;

  /** The static mustache delimiters - defaults to [[ ]]. */
  staticDelimiters?: ParseDelimiters;

  /** The static triple mustache delimiters - defaults to [[[ ]]]. */
  staticTripleDelimiters?: ParseDelimiters;

  /** Whether or not to remove HTML comments from the template. Defaults to true. */
  stripComments?: boolean;

  /** The triple mustache delimiters - defaults to {{{ }}}. */
  tripleDelimiters?: ParseDelimiters;
}

export interface InterpolateOpts {
  script?: boolean;
  textarea?: boolean;
  template?: boolean;
  style?: boolean;
}

export interface ParseOpts extends BaseParseOpts {
  /** If true, the parser will operate as if in a tag e.g. foo="bar" is parsed as an attribute rather than a string. */
  attributes?: boolean;

  /** If true, will parse elements as plain text, which allows the resulting template to be used to produce templates that are also later parsed. */
  textOnlyMode?: boolean;

  /**
   * Map of elements that indicates whether or not to read mustaches within the element.
   * Defaults to `{ script: false, textarea: true, template: false, style: false }`.
   * Elements present within the map treat nested tags as text rather than elements.
   */
  interpolate?: InterpolateOpts;

  /**
   * When `true` will include line positions on each node of the parser output.Defaults to `false`
   */
  includeLinePositions?: boolean;

  /**
   * Setting this to `false` will cause any template expressions to be replaced with a noop.
   * This is useful if you don't trust the templates you are using in contexts like server-side rendering,
   * as a content security policy or simply using the runtime-only version of Ractive that has no parser cover
   * the browser environment pretty well.
   */
  allowExpressions?: boolean;

  /**
   * @todo write doc
   */
  expression?: boolean;
}
