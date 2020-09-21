import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import { Keypath } from 'types/Generic';

import { Ractive } from '../RactiveDefinition';

export default function Ractive$unlink(this: Ractive, keypath: Keypath): Promise<void> {
  const promise = runloop.start();
  this.viewmodel.joinAll(splitKeypath(keypath), { lastLink: false }).unlink();
  runloop.end();
  return promise;
}
