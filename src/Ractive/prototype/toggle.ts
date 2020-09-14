import { badArguments } from 'config/errors';
import { gather, set } from 'shared/set';
import { SetOpts } from 'types/MethodOptions';
import { isString } from 'utils/is';

import { Ractive } from '../Ractive';

// TODO add options to documentation
export default function Ractive$toggle(
  this: Ractive,
  keypath: string,
  options: SetOpts
): Promise<void> {
  if (!isString(keypath)) {
    throw new TypeError(badArguments);
  }

  return set(
    gather(this, keypath, null, options && options.isolated).map(m => [m, !m.get()]),
    options
  );
}
