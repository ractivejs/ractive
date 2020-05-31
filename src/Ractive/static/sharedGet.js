import { splitKeypath } from 'shared/keypaths';

import SharedModel from '../../model/specials/SharedModel';

export default function sharedGet(keypath, opts) {
  return SharedModel.joinAll(splitKeypath(keypath)).get(true, opts);
}
