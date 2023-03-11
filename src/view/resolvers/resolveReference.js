import { splitKeypath } from 'shared/keypaths';
import SharedModel, {
  GlobalModel,
  SharedModel as ContextModel
} from 'src/model/specials/SharedModel';
import { warnIfDebug } from 'utils/log';
import { hasOwn } from 'utils/object';
import { isFunction } from 'utils/is';

function findContext(fragment) {
  let frag = fragment;
  while (frag && !frag.context && !frag.aliases) frag = frag.parent;
  return frag;
}

export default function resolveReference(fragment, ref) {
  const initialFragment = fragment;
  // current context ref
  if (ref === '.') return fragment.findContext();

  // ancestor references
  if (ref[0] === '~') return fragment.ractive.viewmodel.joinAll(splitKeypath(ref.slice(2)));

  // scoped references
  if (ref[0] === '.' || ref[0] === '^') {
    let frag = fragment;
    const parts = ref.split('/');
    const explicitContext = parts[0] === '^^';

    // find nearest context node
    while (frag && !frag.context) {
      frag = up(frag);
    }
    let context = frag && frag.context;

    // walk up the context chain
    while (frag && parts[0] === '^^') {
      parts.shift();

      // the current fragment should always be a context,
      // and if it happens to be an iteration, jump above the each block
      if (frag.isIteration) {
        frag = frag.parent.parent;
      } else {
        // otherwise jump above the current fragment
        frag = up(frag);
      }

      // walk to the next contexted fragment
      while (frag && !frag.context) {
        frag = up(frag);
      }
      context = frag && frag.context;
    }

    if (!context && explicitContext) {
      throw new Error(
        `Invalid context parent reference ('${ref}'). There is not context at that level.`
      );
    }

    // walk up the context path
    while (parts[0] === '.' || parts[0] === '..') {
      const part = parts.shift();

      if (part === '..') {
        // treat reference expressions as their model
        if (!context.parent && context.proxy && context.target) context = context.target.parent;
        else context = context.parent;
      }
    }

    ref = parts.join('/');

    // special case - `{{.foo}}` means the same as `{{./foo}}`
    if (ref[0] === '.') ref = ref.slice(1);
    return context.joinAll(splitKeypath(ref));
  }

  const keys = splitKeypath(ref);
  if (!keys.length) return;
  const base = keys.shift();

  // special refs
  if (base[0] === '@') {
    // shorthand from outside the template
    // @this referring to local ractive instance
    if (base === '@this' || base === '@') {
      return fragment.ractive.viewmodel.getRactiveModel().joinAll(keys);
    } else if (base === '@index' || base === '@key') {
      // @index or @key referring to the nearest repeating index or key
      if (keys.length) badReference(base);
      const repeater = findIter(fragment);
      return repeater && repeater[`get${base[1] === 'i' ? 'Index' : 'Key'}`]();
    } else if (base === '@last') {
      const repeater = findIter(fragment);
      return repeater && repeater.parent.getLast();
    } else if (base === '@global') {
      // @global referring to window or global
      return GlobalModel.joinAll(keys);
    } else if (base === '@shared') {
      // @global referring to window or global
      return SharedModel.joinAll(keys);
    } else if (base === '@keypath' || base === '@rootpath') {
      // @keypath or @rootpath, the current keypath string
      const root = ref[1] === 'r' ? fragment.ractive.root : null;
      let f = fragment;

      while (
        f &&
        (!f.context || (f.isRoot && f.ractive.component && (root || !f.ractive.isolated)))
      ) {
        f = f.isRoot ? f.componentParent : f.parent;
      }

      return f.getKeypath(root);
    } else if (base === '@context') {
      return new ContextModel(fragment.getContext(), 'context').joinAll(keys);
    } else if (base === '@local') {
      // @context-local data
      return fragment.getContext()._data.joinAll(keys);
    } else if (base === '@style') {
      // @style shared model
      return fragment.ractive.constructor._cssModel.joinAll(keys);
    } else if (base === '@helpers') {
      // @helpers instance model
      return fragment.ractive.viewmodel.getHelpers().joinAll(keys);
    } else if (base === '@macro') {
      const handle = findMacro(fragment);
      if (handle) return new ContextModel(handle, 'macro').joinAll(keys);
      else return;
    } else {
      // nope
      throw new Error(`Invalid special reference '${base}'`);
    }
  }

  // helpers
  if (base && !keys.length) {
    const helpers = fragment.ractive.viewmodel.getHelpers();
    if (helpers.has(base)) return helpers.joinKey(base);
  }

  let context = findContext(fragment);

  // check immediate context for a match
  if (context) {
    if (context.context) {
      context = context.context;
    } else {
      // alias block, so get next full context for later
      context = fragment.findContext();
    }
  } else {
    context = fragment.findContext();
  }

  // walk up the fragment hierarchy looking for a matching ref, alias, or key in a context
  let createMapping = false;
  const shouldWarn = fragment.ractive.warnAboutAmbiguity;
  let crossed = 0;
  let model;

  while (fragment) {
    // repeated fragments
    if (fragment.isIteration) {
      if (base === fragment.parent.keyRef) {
        model = fragment.getKey();
      } else if (base === fragment.parent.indexRef) {
        model = fragment.getIndex();
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
      } else if (shouldWarn && crossed) warnIfDebug(`'${ref}' resolved but is ambiguous.`);
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

    // don't consider alias blocks when checking for ambiguity
    if (fragment.context && !fragment.aliases) crossed = 1;

    if (
      !fragment.ractive.isolated &&
      !(fragment.owner && fragment.owner.containerFragment) &&
      (fragment.componentParent || (!fragment.parent && fragment.ractive.component))
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
  if (instance.resolveInstanceMembers && base !== 'data' && base in instance) {
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

function up(fragment) {
  return (
    fragment &&
    ((!fragment.ractive.isolated &&
      !(fragment.owner && fragment.owner.containerFragment) &&
      (fragment.componentParent || (!fragment.parent && fragment.ractive.component))) ||
      fragment.parent)
  );
}

function findIter(start) {
  let fragment = start;
  let next;
  while (!fragment.isIteration && (next = up(fragment))) {
    fragment = next;
  }

  return fragment.isIteration && fragment;
}

function findMacro(start) {
  let fragment = start;
  while (fragment) {
    if (fragment.owner.handle) return fragment.owner.handle;
    fragment = up(fragment);
  }
}

function badReference(key) {
  throw new Error(`An index or key reference (${key}) cannot have child properties`);
}
