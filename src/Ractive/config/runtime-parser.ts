import { doc } from 'config/environment';
import parse, { StandardParserResult } from 'parse/_parse';
import type { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';
import { fromExpression } from 'parse/utils/createFunction';
import { addFunctions } from 'shared/getFunction';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { ParsedTemplate, ParseOpts, Template } from 'types/Parse';
import { isString } from 'utils/is';
import { fatal } from 'utils/log';

const parseOptions = [
  'delimiters',
  'tripleDelimiters',
  'staticDelimiters',
  'staticTripleDelimiters',
  'csp',
  'interpolate',
  'preserveWhitespace',
  'sanitize',
  'stripComments',
  'contextLines',
  'allowExpressions',
  'attributes'
];

const TEMPLATE_INSTRUCTIONS = `Either preparse or use a ractive runtime source that includes the parser. `;

const COMPUTATION_INSTRUCTIONS = `Either include a version of Ractive that can parse or convert your computation strings to functions.`;

function throwNoParse(method: Function, error: string, instructions: string): void {
  if (!method) {
    fatal(`Missing Ractive.parse - cannot parse ${error}. ${instructions}`);
  }
}

export function createFunction(body: string, length: number): Function {
  throwNoParse(fromExpression, 'new expression function', TEMPLATE_INSTRUCTIONS);
  return fromExpression(body, length);
}

export function createFunctionFromString(
  str: string,
  bindTo: Ractive
): () => (this: typeof bindTo) => unknown {
  throwNoParse(parse, 'computation string "${str}"', COMPUTATION_INSTRUCTIONS);
  const template = parse<ExpressionFunctionTemplateItem>(str, { expression: true });
  return function () {
    return template.e.apply(
      bindTo,
      template.r.map(r => bindTo.get(r))
    );
  };
}

// TODO use type ParserHelper
const parser = {
  fromId(id: string, options: { noThrow?: boolean } = {}): string {
    if (!doc) {
      if (options?.noThrow) {
        return;
      }
      throw new Error(`Cannot retrieve template #${id} as Ractive is not running in a browser.`);
    }

    if (id) id = id.replace(/^#/, '');

    let template: HTMLElement;

    if (!(template = doc.getElementById(id))) {
      if (options?.noThrow) {
        return;
      }
      throw new Error(`Could not find template element with id #${id}`);
    }

    if (template.tagName.toUpperCase() !== 'SCRIPT') {
      if (options?.noThrow) {
        return;
      }
      throw new Error(`Template element with id #${id}, must be a <script> element`);
    }

    // TSRChange - was `'textContent' in template ? template.textContent : template.innerHTML;`
    return template?.textContent || template.innerHTML;
  },

  isParsed(template: unknown): boolean {
    return !isString(template);
  },

  getParseOptions(ractive: Ractive): ParseOpts {
    // Could be Ractive or a Component
    if (ractive.defaults) {
      ractive = ractive.defaults;
    }

    return parseOptions.reduce((val, key) => {
      val[key] = ractive[key];
      return val;
    }, {});
  },

  parse<T extends StandardParserResult>(template: string, options: ParseOpts): T {
    throwNoParse(parse, 'template', TEMPLATE_INSTRUCTIONS);
    const parsed = parse<T>(template, options);
    addFunctions(parsed);
    return parsed;
  },

  parseFor(template: Template, ractive: Ractive): ParsedTemplate {
    return this.parse(template, this.getParseOptions(ractive));
  }
};

export default parser;
