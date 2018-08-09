import SharedModel from '../../model/specials/SharedModel';
import { splitKeypath } from 'shared/keypaths';

export default function sharedGet(keypath, opts) {
  return SharedModel.joinAll(splitKeypath(keypath)).get(true, opts);
}
