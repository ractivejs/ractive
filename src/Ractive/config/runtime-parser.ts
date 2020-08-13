import { doc } from 'config/environment';
import parse from 'parse/_parse';
import { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';
import { fromExpression } from 'parse/utils/createFunction';
import { addFunctions } from 'shared/getFunction';
import { ParseOpts } from 'types/Parse';
import { RactiveFake } from 'types/RactiveFake';
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
  bindTo: RactiveFake
): () => (this: typeof bindTo) => any {
  throwNoParse(parse, 'compution string "${str}"', COMPUTATION_INSTRUCTIONS);
  const template = parse<ExpressionFunctionTemplateItem>(str, { expression: true });
  return function() {
    return template.e.apply(
      bindTo,
      template.r.map(r => bindTo.get(r))
    );
  };
}

const parser = {
  fromId(id: string, options: { noThrow?: boolean } = {}) {
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

  isParsed(template: unknown) {
    return !isString(template);
  },

  getParseOptions(ractive: RactiveFake) {
    // Could be Ractive or a Component
    if (ractive.defaults) {
      ractive = ractive.defaults;
    }

    return parseOptions.reduce((val, key) => {
      val[key] = ractive[key];
      return val;
    }, {});
  },

  parse<T>(template: string, options: ParseOpts): T {
    throwNoParse(parse, 'template', TEMPLATE_INSTRUCTIONS);
    const parsed = parse<T>(template, options);
    addFunctions(parsed);
    return parsed;
  },

  parseFor(template, ractive: RactiveFake) {
    return this.parse(template, this.getParseOptions(ractive));
  }
};

export default parser;
