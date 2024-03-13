import { noRegistryFunctionReturn } from 'config/errors';
import { warnIfDebug } from 'utils/log';
import { fillGaps, hasOwn } from 'utils/object';
import parser from 'src/Ractive/config/runtime-parser';
import { findInstance } from 'shared/registry';
import { isArray, isFunction } from 'utils/is';
import { addFunctions } from 'shared/getFunction';

export default function getPartialTemplate(ractive, name, up) {
  // If the partial in instance or view hierarchy instances, great
  let partial = getPartialFromRegistry(ractive, name, up || {});
  if (partial) return partial;

  // Does it exist on the page as a script tag?
  partial = parser.fromId(name, { noThrow: true });
  if (partial) {
    // parse and register to this ractive instance
    const parsed = parser.parseFor(partial, ractive);

    // register extra partials on the ractive instance if they don't already exist
    if (parsed.p) fillGaps(ractive.partials, parsed.p);

    // register (and return main partial if there are others in the template)
    return (ractive.partials[name] = parsed.t);
  }
}

function getPartialFromRegistry(ractive, name, up) {
  // if there was an instance up-hierarchy, cool
  let partial = findParentPartial(name, up.owner);
  if (partial) return partial;

  // find first instance in the ractive or view hierarchy that has this partial
  const instance = findInstance('partials', ractive, name);

  if (!instance) {
    return;
  }

  partial = instance.partials[name];

  // partial is a function?
  let fn;
  if (isFunction(partial)) {
    fn = partial;
    // super partial
    if (fn.styleSet) return fn;

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
    const parsed = parser.parseFor(partial, instance);

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
  return hasOwn(ractive.partials, key) ? ractive : findConstructor(ractive.constructor, key);
}

function findConstructor(constructor, key) {
  if (!constructor) {
    return;
  }
  return hasOwn(constructor.partials, key) ? constructor : findConstructor(constructor.Parent, key);
}

function findParentPartial(name, parent) {
  if (parent) {
    if (
      parent.template &&
      parent.template.p &&
      !isArray(parent.template.p) &&
      hasOwn(parent.template.p, name)
    ) {
      return parent.template.p[name];
    } else if (parent.up && parent.up.owner) {
      return findParentPartial(name, parent.up.owner);
    }
  }
}
