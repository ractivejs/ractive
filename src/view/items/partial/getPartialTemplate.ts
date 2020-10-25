import { noRegistryFunctionReturn } from 'config/errors';
import type { PartialTemplateItem } from 'parse/converters/templateItemDefinitions';
import { addFunctions } from 'shared/getFunction';
import { findInstance } from 'shared/registry';
import parser from 'src/Ractive/config/runtime-parser';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { ParseFn } from 'types/Parse';
import { isArray, isFunction } from 'utils/is';
import { warnIfDebug } from 'utils/log';
import { fillGaps, hasOwn } from 'utils/object';
import type Fragment from 'view/Fragment';

export type PartialRuntime = PartialTemplateItem | ParseFn;

export default function getPartialTemplate(
  ractive: Ractive,
  name: string,
  up: Fragment
): PartialRuntime {
  // If the partial in instance or view hierarchy instances, great
  const partial = getPartialFromRegistry(ractive, name, up);

  if (partial) return partial;

  // Does it exist on the page as a script tag?
  const partialText = parser.fromId(name, { noThrow: true });
  if (partialText) {
    // parse and register to this ractive instance
    const parsed = parser.parseFor(partialText, ractive);

    // register extra partials on the ractive instance if they don't already exist
    if (parsed.p) fillGaps(ractive.partials, parsed.p);

    // register (and return main partial if there are others in the template)
    return (ractive.partials[name] = parsed.t);
  }
}

function getPartialFromRegistry(ractive: Ractive, name: string, up: Fragment) {
  // if there was an instance up-hierarchy, cool
  const parentPartial = findParentPartial(name, up?.owner);
  if (parentPartial) return parentPartial;

  // find first instance in the ractive or view hierarchy that has this partial
  const instance = findInstance('partials', ractive, name);

  if (!instance) {
    return;
  }

  let partial: any = instance.partials[name];

  // partial is a function?
  let fn;
  if (isFunction(partial)) {
    fn = partial;
    // super partial
    if ('styleSet' in fn) return fn;

    fn = partial.bind(instance);
    fn.isOwner = hasOwn(instance.partials, name);
    partial = fn.call(ractive, parser);
  }

  if (!partial && partial !== '') {
    warnIfDebug(noRegistryFunctionReturn, name, 'partial', 'partial', {
      ractive
    });
    return;
  }

  // If this was added manually to the registry,
  // but hasn't been parsed, parse it now
  if (!parser.isParsed(partial)) {
    // use the parseOptions of the ractive instance on which it was found
    const parsed = parser.parseFor(<string>partial, instance);

    // Partials cannot contain nested partials!
    // TODO add a test for this
    if (parsed.p) {
      warnIfDebug('Partials ({{>%s}}) cannot contain nested inline partials', name, { ractive });
    }

    // if fn, use instance to store result, otherwise needs to go
    // in the correct point in prototype chain on instance or constructor
    const target = fn ? instance : findOwner(instance, name);

    // may be a template with partials, which need to be registered and main template extracted
    target.partials[name] = partial = parsed.t;
  }

  // store for reset
  if (fn) partial._fn = fn;

  // if the partial is a pre-parsed template object, import any expressions and update the registry
  if (partial.v) {
    addFunctions(partial);
    return (instance.partials[name] = partial.t);
  } else {
    return partial;
  }
}

function findOwner(ractive, key) {
  return hasOwn(ractive.partials, key)
    ? ractive
    : findConstructor(<typeof Ractive>ractive.constructor, key);
}

function findConstructor(constructor, key) {
  if (!constructor) return;
  return hasOwn(constructor.partials, key) ? constructor : findConstructor(constructor.Parent, key);
}

function findParentPartial(name: string, parent): PartialTemplateItem {
  if (parent) {
    if (parent.template?.p && !isArray(parent.template.p) && hasOwn(parent.template.p, name)) {
      return parent.template.p[name];
    } else if (parent.up?.owner) {
      return findParentPartial(name, parent.up.owner);
    }
  }
}
