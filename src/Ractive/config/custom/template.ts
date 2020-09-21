import { TEMPLATE_VERSION } from 'config/template';
import { addFunctions } from 'shared/getFunction';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { InitOpts } from 'types/InitOptions';
import type { ParsedTemplate, ParseFn, Template } from 'types/Parse';
import { isFunction, isNumber, isObject, isString } from 'utils/is';
import { hasOwn } from 'utils/object';

import parser from '../runtime-parser';

export interface RactiveDynamicTemplate {
  /** If not set it means that is not dynamic */
  fn?: ParseFn;
  /** Mix between Parsed template and template */
  result: any;
}

interface TemplateConfigurator {
  name: 'template';
  extend: (parent: Ractive['constructor'], proto: Ractive, options: InitOpts) => void;
  init: (parent: Ractive['constructor'], proto: Ractive, options: InitOpts) => void;
  reset: (ractive: Ractive) => void;
}

const templateConfigurator: TemplateConfigurator = {
  name: 'template',

  extend(_Parent, proto, options) {
    // only assign if exists
    if ('template' in options) {
      const template = options.template;

      if (isFunction(template)) {
        proto.template = template;
      } else {
        proto.template = parseTemplate(template, proto);
      }
    }
  },

  init(Parent, ractive, options) {
    // TODO because of prototypal inheritance, we might just be able to use
    // ractive.template, and not bother passing through the Parent object.
    // At present that breaks the test mocks' expectations
    let template = 'template' in options ? options.template : Parent.prototype.template;
    template = template || { v: TEMPLATE_VERSION, t: [] };

    if (isFunction(template)) {
      const fn = template;
      template = getDynamicTemplate(ractive, fn);

      ractive._config.template = {
        fn,
        result: template
      };
    }

    template = parseTemplate(template, ractive);

    // TODO the naming of this is confusing - ractive.template refers to [...],
    // but Component.prototype.template refers to {v:1,t:[],p:[]}...
    // it's unnecessary, because the developer never needs to access
    // ractive.template
    ractive.template = template.t;

    if (template.p) {
      extendPartials(ractive.partials, template.p);
    }
  },

  reset(ractive) {
    const result = resetValue(ractive);

    if (result) {
      const parsed = parseTemplate(result, ractive);

      ractive.template = parsed.t;
      extendPartials(ractive.partials, parsed.p, true);

      return true;
    }
  }
};

export default templateConfigurator;

function resetValue(ractive: Ractive): RactiveDynamicTemplate['result'] {
  const initial = ractive._config.template;

  // If this isn't a dynamic template, there's nothing to do
  if (!initial || !initial.fn) {
    return;
  }

  const result = getDynamicTemplate(ractive, initial.fn);

  // TODO deep equality check to prevent unnecessary re-rendering
  // in the case of already-parsed templates
  if (result !== initial.result) {
    initial.result = result;
    return result;
  }
}

function getDynamicTemplate(ractive: Ractive, fn: ParseFn): ReturnType<ParseFn> {
  return fn.call(ractive, {
    fromId: parser.fromId,
    isParsed: parser.isParsed,
    parse(template, options = parser.getParseOptions(ractive)) {
      return parser.parse(template, options);
    }
  });
}

function parseTemplate(template: string | Template, ractive: Ractive): ParsedTemplate {
  let parsed: ParsedTemplate;
  if (isString(template)) {
    // parse will validate and add expression functions
    parsed = parseAsString(template, ractive);
  } else {
    // need to validate and add exp for already parsed template
    validate(template);

    parsed = <ParsedTemplate>template;
    addFunctions(parsed);
  }

  return parsed;
}

function parseAsString(template: string, ractive: Ractive): ParsedTemplate {
  // ID of an element containing the template?
  if (typeof template === 'string' && template[0] === '#') {
    template = parser.fromId(template);
  }

  return parser.parseFor(template, ractive);
}

function validate(template: unknown): void {
  // Check that the template even exists
  if (template == undefined) {
    throw new Error(`The template cannot be ${template}.`);
  }

  // Check the parsed template has a version at all
  if (isObject(template) && !isNumber(template.v)) {
    throw new Error(
      "The template parser was passed a non-string template, but the template doesn't have a version.  Make sure you're passing in the template you think you are."
    );
  }

  // Check we're using the correct version
  if (isObject(template) && template.v !== TEMPLATE_VERSION) {
    throw new Error(
      `Mismatched template version (expected ${TEMPLATE_VERSION}, got ${template.v}) Please ensure you are using the latest version of Ractive.js in your build process as well as in your app`
    );
  }
}

function extendPartials(
  existingPartials: Ractive['partials'],
  newPartials: Ractive['partials'],
  overwrite?: boolean
): void {
  if (!newPartials) return;

  // TODO there's an ambiguity here - we need to overwrite in the `reset()`
  // case, but not initially...

  for (const key in newPartials) {
    if (overwrite || !hasOwn(existingPartials, key)) {
      existingPartials[key] = newPartials[key];
    }
  }
}
