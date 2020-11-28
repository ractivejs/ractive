import type { ModelGetOpts } from 'model/ModelBase';
import SharedModel from 'model/specials/SharedModel';
import { splitKeypath } from 'shared/keypaths';
import type { Keypath } from 'types/Generic';

export default function sharedGet(keypath: Keypath, opts: ModelGetOpts): unknown {
  return SharedModel.joinAll(splitKeypath(keypath)).get(true, opts);
}
