import { ModelGetOpts } from 'model/ModelBase';
import { splitKeypath } from 'shared/keypaths';
import { Keypath } from 'types/Generic';

import { Ractive } from '../Ractive';

export default function styleGet(this: Ractive, keypath: Keypath, opts: ModelGetOpts): any {
  return this._cssModel.joinAll(splitKeypath(keypath)).get(true, opts);
}
