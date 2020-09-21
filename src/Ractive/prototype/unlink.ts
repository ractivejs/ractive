import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import type { Keypath } from 'types/Generic';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$unlink(this: Ractive, keypath: Keypath): Promise<void> {
  const promise = runloop.start();
  this.viewmodel.joinAll(splitKeypath(keypath), { lastLink: false }).unlink();
  runloop.end();
  return promise;
}
