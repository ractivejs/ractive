import { splitKeypath } from "shared/keypaths";
import SharedModel, { GlobalModel } from "src/model/specials/SharedModel";
import { warnIfDebug } from "utils/log";
import { hasOwn } from "utils/object";
import { isFunction } from "utils/is";

export default function resolveReference(fragment, ref) {
  const initialFragment = fragment;
  // current context ref
  if (ref === ".") return fragment.findContext();

  // ancestor references
  if (ref[0] === "~") return fragment.ractive.viewmodel.joinAll(splitKeypath(ref.slice(2)));

  // scoped references
  if (ref[0] === "." || ref[0] === "^") {
    let frag = fragment;
    const parts = ref.split("/");
    const explicitContext = parts[0] === "^^";
    let context = explicitContext ? null : fragment.findContext();

    // account for the first context hop
    if (explicitContext) parts.unshift("^^");

    // walk up the context chain
    while (parts[0] === "^^") {
      parts.shift();
      context = null;
      while (frag && !context) {
        context = frag.context;
        frag = frag.parent.component ? frag.parent.component.up : frag.parent;
      }
    }

    if (!context && explicitContext) {
      throw new Error(
        `Invalid context parent reference ('${ref}'). There is not context at that level.`
      );
    }

    // walk up the context path
    while (parts[0] === "." || parts[0] === "..") {
      const part = parts.shift();

      if (part === "..") {
        context = context.parent;
      }
    }

    ref = parts.join("/");

    // special case - `{{.foo}}` means the same as `{{./foo}}`
    if (ref[0] === ".") ref = ref.slice(1);
    return context.joinAll(splitKeypath(ref));
  }

  const keys = splitKeypath(ref);
  if (!keys.length) return;
  const base = keys.shift();

  // special refs
  if (base[0] === "@") {
    // shorthand from outside the template
    // @this referring to local ractive instance
    if (base === "@this" || base === "@") {
      return fragment.ractive.viewmodel.getRactiveModel().joinAll(keys);
    } else if (base === "@index" || base === "@key") {
      // @index or @key referring to the nearest repeating index or key
      if (keys.length) badReference(base);
      const repeater = fragment.findRepeatingFragment();
      // make sure the found fragment is actually an iteration
      if (!repeater.isIteration) return;
      return (
        repeater.context && repeater.context.getKeyModel(repeater[ref[1] === "i" ? "index" : "key"])
      );
    } else if (base === "@global") {
      // @global referring to window or global
      return GlobalModel.joinAll(keys);
    } else if (base === "@shared") {
      // @global referring to window or global
      return SharedModel.joinAll(keys);
    } else if (base === "@keypath" || base === "@rootpath") {
      // @keypath or @rootpath, the current keypath string
      const root = ref[1] === "r" ? fragment.ractive.root : null;
      let context = fragment.findContext();

      // skip over component roots, which provide no context
      while (root && context.isRoot && context.ractive.component) {
        context = context.ractive.component.up.findContext();
      }

      return context.getKeypathModel(root);
    } else if (base === "@context") {
      return new ContextModel(fragment.getContext());
    } else if (base === "@local") {
      // @context-local data
      return fragment.getContext()._data.joinAll(keys);
    } else if (base === "@style") {
      // @style shared model
      return fragment.ractive.constructor._cssModel.joinAll(keys);
    } else {
      // nope
      throw new Error(`Invalid special reference '${base}'`);
    }
  }

  const context = fragment.findContext();

  // check immediate context for a match
  if (context.has(base)) {
    return context.joinKey(base).joinAll(keys);
  }

  // walk up the fragment hierarchy looking for a matching ref, alias, or key in a context
  let createMapping = false;
  const shouldWarn = fragment.ractive.warnAboutAmbiguity;
  let model;

  while (fragment) {
    // repeated fragments
    if (fragment.isIteration) {
      if (base === fragment.parent.keyRef) {
        model = fragment.context.getKeyModel(fragment.key);
      } else if (base === fragment.parent.indexRef) {
        model = fragment.context.getKeyModel(fragment.index);
      }

      if (model && keys.length) badReference(base);
    }

    // alias node or iteration
    if (!model && fragment.aliases && hasOwn(fragment.aliases, base)) {
      model = fragment.aliases[base];
    }

    // check fragment context to see if it has the key we need
    if (!model && fragment.context && fragment.context.has(base)) {
      model = fragment.context.joinKey(base);

      // this is an implicit mapping
      if (createMapping) {
        if (shouldWarn)
          warnIfDebug(
            `'${ref}' resolved but is ambiguous and will create a mapping to a parent component.`
          );
      } else if (shouldWarn) warnIfDebug(`'${ref}' resolved but is ambiguous.`);
    }

    if (model) {
      if (createMapping) {
        model = initialFragment.ractive.viewmodel.createLink(base, model, base, { implicit: true });
      }

      if (keys.length > 0 && isFunction(model.joinAll)) {
        model = model.joinAll(keys);
      }

      return model;
    }

    if (
      (fragment.componentParent || (!fragment.parent && fragment.ractive.component)) &&
      !fragment.ractive.isolated
    ) {
      // ascend through component boundary
      fragment = fragment.componentParent || fragment.ractive.component.up;
      createMapping = true;
    } else {
      fragment = fragment.parent;
    }
  }

  // if enabled, check the instance for a match
  const instance = initialFragment.ractive;
  if (instance.resolveInstanceMembers && base !== "data" && base in instance) {
    return instance.viewmodel
      .getRactiveModel()
      .joinKey(base)
      .joinAll(keys);
  }

  if (shouldWarn) {
    warnIfDebug(`'${ref}' is ambiguous and did not resolve.`);
  }

  // didn't find anything, so go ahead and create the key on the local model
  return context.joinKey(base).joinAll(keys);
}

function badReference(key) {
  throw new Error(`An index or key reference (${key}) cannot have child properties`);
}

class ContextModel {
  constructor(context) {
    this.context = context;
  }

  get() {
    return this.context;
  }
}
