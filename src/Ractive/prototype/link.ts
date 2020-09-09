import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import { LinkOpts } from 'types/Options';
import resolveReference from 'view/resolvers/resolveReference';

import { Ractive } from '../Ractive';

export default function Ractive$link(
  this: Ractive,
  source: string,
  here: string,
  options?: LinkOpts
): Promise<void> {
  const target = options?.ractive || options?.instance || this;

  let model;
  // may need to allow a mapping to resolve implicitly
  const sourcePath = splitKeypath(source);
  if (!target.viewmodel.has(sourcePath[0]) && target.component) {
    model = resolveReference(target.component.up, sourcePath[0]);
    model = model.joinAll(sourcePath.slice(1));
  }

  const src = model || target.viewmodel.joinAll(sourcePath);
  const dest = this.viewmodel.joinAll(splitKeypath(here), { lastLink: false });

  if (isUpstream(src, dest) || isUpstream(dest, src)) {
    throw new Error('A keypath cannot be linked to itself.');
  }

  const promise = runloop.start();

  dest.link(src, options?.keypath || source);

  runloop.end();

  return promise;
}

// TODO add typings
function isUpstream(check, start): boolean {
  let model = start;
  while (model) {
    if (model === check || model.owner === check) return true;
    model = model.target || model.parent;
  }
  return false;
}
