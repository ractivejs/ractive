import { splitKeypath } from 'shared/keypaths';

export default function styleGet(keypath, opts) {
  return this._cssModel.joinAll(splitKeypath(keypath)).get(true, opts);
}
