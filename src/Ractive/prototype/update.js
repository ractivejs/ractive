import Hook from "src/events/Hook";
import runloop from "src/global/runloop";
import { splitKeypath } from "shared/keypaths";
import { isString } from "utils/is";

const updateHook = new Hook("update");

export function update(ractive, model, options) {
  // if the parent is wrapped, the adaptor will need to be updated before
  // updating on this keypath
  if (model.parent && model.parent.wrapper) {
    model.parent.adapt();
  }

  const promise = runloop.start();

  model.mark(options && options.force);

  // notify upstream of changes
  model.notifyUpstream();

  runloop.end();

  updateHook.fire(ractive, model);

  return promise;
}

export default function Ractive$update(keypath, options) {
  let opts, path;

  if (isString(keypath)) {
    path = splitKeypath(keypath);
    opts = options;
  } else {
    opts = keypath;
  }

  return update(this, path ? this.viewmodel.joinAll(path) : this.viewmodel, opts);
}
