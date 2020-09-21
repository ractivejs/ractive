import type LinkModel from 'model/LinkModel';
import type Model from 'model/Model';
import { splitKeypath } from 'shared/keypaths';
import hooks from 'src/events/Hook';
import runloop from 'src/global/runloop';
import type { Keypath } from 'types/Generic';
import type { UpdateOpts } from 'types/MethodOptions';
import { isString } from 'utils/is';

import type { Ractive } from '../RactiveDefinition';

export function update(
  ractive: Ractive,
  model: LinkModel | Model,
  options: UpdateOpts
): Promise<void> {
  // if the parent is wrapped, the adaptor will need to be updated before
  // updating on this keypath
  if (model.parent && (<Model>model.parent).wrapper) {
    (<Model>model.parent).adapt();
  }

  const promise = runloop.start();

  model.mark(options && options.force);

  // notify upstream of changes
  model.notifyUpstream();

  runloop.end();

  hooks.update.fire(ractive, model);

  return promise;
}

function Ractive$update(options: UpdateOpts): ReturnType<typeof update>;
function Ractive$update(keypath: Keypath, options: UpdateOpts): ReturnType<typeof update>;
function Ractive$update(
  keypath: Keypath | UpdateOpts,
  options?: UpdateOpts
): ReturnType<typeof update> {
  let opts: UpdateOpts, path: string[];

  if (isString(keypath)) {
    path = splitKeypath(keypath);
    opts = options;
  } else {
    opts = keypath;
  }

  return update(this, path ? this.viewmodel.joinAll(path) : this.viewmodel, opts);
}

export default Ractive$update;
