export type ParseDelimiters = [string, string];

export interface SanitizeOpts {
  /** A list of element names to remove from the template. */
  elements: string[];

  /** Whether or not to remove DOM event listener attributes, like onclick, from the template. */
  eventAttributes?: boolean;
}

export interface BaseParseOpts {
  /** The number of lines of template above and below a line with an error to include in the error message. */
  contextLines?: number;

  /** Whether or not to produce a map of expression string -> function when parsing the template. */
  csp?: boolean;

  /** The regular mustach delimiters - defaults to {{ }}. */
  delimiters?: ParseDelimiters;

  /** Whether or not to collapse consective whitespace into a single space. */
  preserveWhitespace?: boolean;

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

export interface ParseOpts extends BaseParseOpts {
  /** If true, the parser will operate as if in a tag e.g. foo="bar" is parsed as an attribute rather than a string. */
  attributes?: boolean;

  /** If true, will parse elements as plain text, which allows the resulting template to be used to produce templates that are also later parsed. */
  textOnlyMode?: boolean;
}
