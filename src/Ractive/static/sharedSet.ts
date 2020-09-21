import { Keypath } from 'types/Generic';
import { SetOpts } from 'types/MethodOptions';
import { isObjectType } from 'utils/is';

import SharedModel from '../../model/specials/SharedModel';
import { build, set } from '../../shared/set';
import { Ractive } from '../Ractive';

export default function sharedSet(
  keypath: Keypath,
  value: unknown,
  options: SetOpts
): ReturnType<typeof set> {
  const opts = isObjectType(keypath) ? value : options;
  const model = SharedModel;

  return set(build(({ viewmodel: model } as unknown) as Ractive, keypath, value, true), opts);
}
