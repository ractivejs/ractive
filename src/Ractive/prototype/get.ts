import ModelBase from 'model/ModelBase';
import RootModel from 'model/RootModel';
import { FakeFragment } from 'shared/getRactiveContext';
import { splitKeypath } from 'shared/keypaths';
import { GetOpts } from 'types/MethodOptions';
import { isString } from 'utils/is';
import resolveReference from 'view/resolvers/resolveReference';

import { Ractive } from '../RactiveDefinition';

function Ractive$get(this: Ractive, opts?: GetOpts): any;
function Ractive$get(this: Ractive, keypath: string, opts?: GetOpts): any;
function Ractive$get(this: Ractive, keypath: string | GetOpts, opts?: GetOpts): any {
  if (!isString(keypath)) return this.viewmodel.get(true, keypath);

  const keys = splitKeypath(keypath);
  const key = keys[0];

  let model: RootModel | ModelBase;

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

export default Ractive$get;
