import type { ModelGetOpts } from 'model/ModelBase';
import { splitKeypath } from 'shared/keypaths';
import type { Keypath } from 'types/Generic';

import type { Ractive } from '../RactiveDefinition';

export default function styleGet(this: Ractive, keypath: Keypath, opts: ModelGetOpts): string {
  return <string>this._cssModel.joinAll(splitKeypath(keypath)).get(true, opts);
}
