import { FakeFragment } from 'shared/getRactiveContext';
import { splitKeypath } from 'shared/keypaths';
import resolveReference from 'src/view/resolvers/resolveReference';
import { isString } from 'utils/is';

export default function Ractive$get(keypath, opts) {
  if (!isString(keypath)) return this.viewmodel.get(true, keypath);

  const keys = splitKeypath(keypath);
  const key = keys[0];

  let model;

  if (!this.viewmodel.has(key)) {
    // if this is an inline component, we may need to create
    // an implicit mapping
    if (this.component && !this.isolated) {
      model = resolveReference(this.fragment || new FakeFragment(this), key);
    }
  }

  model = this.viewmodel.joinAll(keys);
  return model.get(true, opts);
}
